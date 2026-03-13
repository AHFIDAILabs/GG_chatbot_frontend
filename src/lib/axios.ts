import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing  = false;
let refreshQueue: Array<(token: null) => void> = [];

function processQueue(error: AxiosError | null) {
  refreshQueue.forEach(cb => cb(null));
  refreshQueue = [];
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    // Network error (backend offline) — reject silently, never redirect
    if (!error.response) return Promise.reject(error);

    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url      = original?.url ?? '';

    // Auth endpoints — failing here is expected, never refresh or redirect
    const isAuthEndpoint =
      url.includes('/auth/me')       ||
      url.includes('/auth/refresh')  ||
      url.includes('/auth/login')    ||
      url.includes('/auth/register');

    if (error.response.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise(resolve => {
          refreshQueue.push(() => resolve(api(original)));
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // Only redirect when NOT already on an auth page — prevents reload loop
        if (typeof window !== 'undefined') {
          const onAuthPage =
            window.location.pathname.startsWith('/login') ||
            window.location.pathname.startsWith('/register');
          if (!onAuthPage) window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
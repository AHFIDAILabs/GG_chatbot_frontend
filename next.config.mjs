/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow service worker + manifest to be served from /public
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type',  value: 'application/javascript; charset=utf-8' },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        { key: 'Content-Type', value: 'application/manifest+json' },
      ],
    },
  ],
};

export default nextConfig;

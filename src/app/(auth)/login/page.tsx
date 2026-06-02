'use client';

import { useState, FormEvent } from 'react';
import { useRouter }           from 'next/navigation';
import Link                    from 'next/link';
import { useAuth }             from '../../../hooks';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login, error, clearError } = useAuth();
  const router                       = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'admin')            router.push('/admin');
      else if (user.role === 'facilitator') router.push('/dashboard');
      else                                  router.push('/chat');
    } catch {
      // error set in context
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 40px 10px 13px',
    borderRadius: 9, background: 'var(--surface-input)',
    border: '1px solid var(--border-input)', color: 'var(--accent-text)',
    fontSize: 16, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="w-full overflow-y-auto" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div className="flex justify-center px-4 py-8 sm:py-16">
        <div
          className="w-full rounded-2xl p-5 sm:p-8"
          style={{ maxWidth: 400, background: 'var(--surface)', border: '1px solid var(--border-input)' }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-black text-[19px] shrink-0"
              style={{ background: 'var(--accent-gradient)', color: '#09160d' }}
            >A</div>
            <div>
              <div className="font-bold text-[16px]" style={{ color: 'var(--txt-1)' }}>Amara</div>
              <div className="text-[11px]" style={{ color: 'var(--txt-4)' }}>by GGCL Academy</div>
            </div>
          </div>

          <div className="font-bold text-[18px] sm:text-[20px] mb-1" style={{ color: 'var(--txt-1)' }}>Welcome back</div>
          <div className="text-[13px] mb-5 sm:mb-6" style={{ color: 'var(--txt-3)' }}>
            Sign in to access your saved chats and progress
          </div>

          {error && (
            <div className="text-[12.5px] px-4 py-3 rounded-lg mb-5"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-txt)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" inputMode="email" style={inputStyle} />
            </div>

            <div className="mb-5 sm:mb-6">
              <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  autoComplete="current-password" style={inputStyle} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[16px]"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-4)', padding: 0 }}
                  tabIndex={-1}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-[11px] rounded-[9px] font-bold text-[14px] border-none"
              style={{ background: 'var(--accent-gradient)', color: '#09160d',
                fontFamily: 'DM Sans, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="text-center mt-4 text-[13px]" style={{ color: 'var(--txt-3)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-faint)' }} />
            <span className="text-[11px]" style={{ color: 'var(--txt-4)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-faint)' }} />
          </div>

          {/* Back to chat — no account needed */}
          <button
            onClick={() => router.push('/chat')}
            className="w-full py-[10px] rounded-[9px] text-[13.5px] font-semibold border transition-all duration-150"
            style={{ background: 'transparent', borderColor: 'var(--border-faint)',
              color: 'var(--txt-2)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-input)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-faint)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-2)';
            }}
          >
            Continue chatting without an account
          </button>
          <p className="text-center text-[10.5px] mt-2" style={{ color: 'var(--txt-5)' }}>
            Chat history won&apos;t be saved
          </p>
        </div>
      </div>
    </div>
  );
}

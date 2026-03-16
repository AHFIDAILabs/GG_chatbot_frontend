'use client';

import { useState, FormEvent } from 'react';
import { useRouter }           from 'next/navigation';
import Link                    from 'next/link';
import { useAuth }             from '../../../hooks';
import { UserRole, AgeGroupUser } from '../../../types';

export default function RegisterPage() {
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [role,        setRole]        = useState<UserRole>('girl');
  const [ageGroup,    setAgeGroup]    = useState<AgeGroupUser>(null);
  const [consent,     setConsent]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const { register, error, clearError } = useAuth();
  const router                          = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      await register({ name, email, password, role, ageGroup, consentGiven: consent });
      router.push('/chat');
    } catch {
      // error already set in context
    } finally {
      setLoading(false);
    }
  };

  const needsConsent = role === 'girl' && ageGroup === '10-13';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.18)',
    color: '#d1fae5', fontSize: 16, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };

  const optionBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, minWidth: 0, padding: '9px 8px', borderRadius: 8,
    background:  active ? 'rgba(74,222,128,0.13)' : 'rgba(255,255,255,0.04)',
    border:      `1px solid ${active ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
    color:       active ? '#4ade80' : 'rgba(255,255,255,0.5)',
    fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
    transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  });

  return (
    <div className="flex justify-center px-4 py-8 sm:py-12" style={{ background: '#09160d', minHeight: '100dvh' }}>
      <div className="w-full max-w-[420px] rounded-2xl p-5 sm:p-8 h-fit"
        style={{ background: '#0b1d0f', border: '1px solid rgba(74,222,128,0.18)' }}>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 sm:mb-7">
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-black text-[19px] shrink-0"
            style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', color: '#09160d' }}>A</div>
          <div>
            <div className="font-bold text-[16px] text-white">Amara</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>by GGCL Academy</div>
          </div>
        </div>

        <div className="font-bold text-[18px] sm:text-[20px] text-white mb-1">Create your account</div>
        <div className="text-[13px] mb-5 sm:mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Create an account to save your chats and track your progress
        </div>

        {error && (
          <div className="text-[12.5px] px-4 py-3 rounded-lg mb-5"
            style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-[11.5px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" style={inputStyle} />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11.5px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" inputMode="email" style={inputStyle} />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[11.5px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Password (min 8 characters)</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={8} autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <button
                type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[16px]"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0 }}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="block text-[11.5px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>I am a</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole('girl')}        style={optionBtnStyle(role === 'girl')}>👧 Girl</button>
              <button type="button" onClick={() => setRole('facilitator')} style={optionBtnStyle(role === 'facilitator')}>👩‍🏫 Facilitator</button>
            </div>
          </div>

          {/* Age group */}
          {role === 'girl' && (
            <div className="mb-4">
              <label className="block text-[11.5px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Age group</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAgeGroup('10-13')} style={optionBtnStyle(ageGroup === '10-13')}>Ages 10–13</button>
                <button type="button" onClick={() => setAgeGroup('14-18')} style={optionBtnStyle(ageGroup === '14-18')}>Ages 14–18</button>
              </div>
            </div>
          )}

          {/* Consent */}
          {needsConsent && (
            <div className="mb-4 flex items-start gap-3">
              <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="mt-1 shrink-0" style={{ width: 16, height: 16, accentColor: '#4ade80' }} />
              <label htmlFor="consent" className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                I confirm that a parent or guardian has given consent for this account (required for ages 10–13)
              </label>
            </div>
          )}

          <button type="submit" disabled={loading || (needsConsent && !consent)}
            className="w-full py-[11px] rounded-[9px] font-bold text-[14px] border-none mt-2"
            style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', color: '#09160d',
              fontFamily: 'DM Sans, sans-serif',
              cursor: loading || (needsConsent && !consent) ? 'not-allowed' : 'pointer',
              opacity: loading || (needsConsent && !consent) ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="text-center mt-5 text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#4ade80' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
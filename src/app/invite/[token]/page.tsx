'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams }           from 'next/navigation';
import api                                from '../../../lib/axios';
import { useAuth }                        from '../../../hooks';

type InviteState = 'loading' | 'valid' | 'invalid';

export default function InvitePage() {
  const params = useParams();
  const token  = typeof params.token === 'string' ? params.token : '';

  const [inviteState,  setInviteState]  = useState<InviteState>('loading');
  const [inviteNote,   setInviteNote]   = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [inviteError,  setInviteError]  = useState('');

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const router       = useRouter();

  useEffect(() => {
    if (!token) { setInviteState('invalid'); setInviteError('Missing invite token.'); return; }
    api.get<{ success: true; data: { valid: boolean; expiresAt: string; note: string } }>(
      `/invite/${token}`,
    )
      .then(({ data }) => {
        setInviteState('valid');
        setInviteNote(data.data.note);
        setInviteExpiry(data.data.expiresAt);
      })
      .catch((err) => {
        setInviteState('invalid');
        setInviteError(err?.response?.data?.message ?? 'This invite link is invalid or has expired.');
      });
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await register({ name, email, password, inviteToken: token });
      router.replace('/dashboard');
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    background: 'var(--surface-input)', border: '1px solid var(--border-input)',
    color: 'var(--accent-text)', fontSize: 15, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="flex justify-center px-4 py-10" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <div className="w-full max-w-[420px] h-fit">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-black text-[19px] shrink-0"
            style={{ background: 'var(--accent-gradient)', color: '#09160d' }}
          >A</div>
          <div>
            <div className="font-bold text-[16px]" style={{ color: 'var(--txt-1)' }}>Amara</div>
            <div className="text-[11px]" style={{ color: 'var(--txt-4)' }}>by GGCL Academy</div>
          </div>
        </div>

        {/* Loading */}
        {inviteState === 'loading' && (
          <div className="text-center py-16 text-[13px]" style={{ color: 'var(--txt-4)' }}>
            Verifying invite link…
          </div>
        )}

        {/* Invalid */}
        {inviteState === 'invalid' && (
          <div className="rounded-[14px] p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--danger-border)' }}>
            <div className="text-[28px] mb-3">🔗</div>
            <div className="font-bold text-[16px] mb-2" style={{ color: 'var(--txt-1)' }}>Invalid invite link</div>
            <div className="text-[13px] leading-relaxed" style={{ color: 'var(--txt-3)' }}>
              {inviteError}
            </div>
            <div className="text-[12px] mt-4" style={{ color: 'var(--txt-4)' }}>
              Contact your GGCL administrator for a new invite.
            </div>
          </div>
        )}

        {/* Valid — registration form */}
        {inviteState === 'valid' && (
          <div className="rounded-2xl p-5 sm:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border-input)' }}>

            {/* Invite badge */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-[8px] mb-5"
              style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-strong)' }}
            >
              <span className="text-[14px]">👩‍🏫</span>
              <div>
                <div className="text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}>Facilitator invite</div>
                {inviteNote && (
                  <div className="text-[10.5px] mt-[1px]" style={{ color: 'var(--txt-4)' }}>{inviteNote}</div>
                )}
                {inviteExpiry && (
                  <div className="text-[10px] mt-[1px]" style={{ color: 'var(--txt-4)' }}>
                    Expires {new Date(inviteExpiry).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>

            <div className="font-bold text-[18px] mb-1" style={{ color: 'var(--txt-1)' }}>Create your facilitator account</div>
            <div className="text-[13px] mb-5" style={{ color: 'var(--txt-3)' }}>
              You'll get a group code to share with your girls after registration.
            </div>

            {formError && (
              <div className="text-[12.5px] px-4 py-3 rounded-lg mb-4"
                style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-txt)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  required autoComplete="name" style={inputStyle} />
              </div>

              <div className="mb-4">
                <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" inputMode="email" style={inputStyle} />
              </div>

              <div className="mb-5">
                <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Password (min 8 characters)</label>
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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-4)', padding: 0 }}
                    tabIndex={-1}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full py-[11px] rounded-[9px] font-bold text-[14px] border-none"
                style={{
                  background: 'var(--accent-gradient)',
                  color: '#09160d',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {submitting ? 'Creating account…' : 'Create facilitator account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

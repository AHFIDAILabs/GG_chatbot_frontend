'use client';

import { useState, FormEvent } from 'react';
import { useAuth }             from '../../../../hooks';

export default function SettingsPage() {
  const { user, updateMe, error, clearError } = useAuth();

  const [name,    setName]    = useState(user?.name    ?? '');
  const [copied,  setCopied]  = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const copyCode = async () => {
    if (!user?.groupCode) return;
    await navigator.clipboard.writeText(user.groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);
    setSaving(true);
    try {
      await updateMe({ name: name.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    background: 'var(--surface-input)', border: '1px solid var(--border-input)',
    color: 'var(--accent-text)', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-w-[580px] mx-auto">

      {/* Group code card */}
      <div
        className="rounded-[14px] p-5 mb-6"
        style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-strong)' }}
      >
        <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'rgba(74,222,128,0.5)' }}>
          Your Group Code
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-mono font-black text-[28px] tracking-[0.12em]"
            style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}
          >
            {user.groupCode ?? '—'}
          </span>
          {user.groupCode && (
            <button
              onClick={copyCode}
              className="px-3 py-[6px] rounded-[7px] text-[11.5px] transition-all"
              style={{
                background:  copied ? 'var(--accent-dim)' : 'var(--surface-input)',
                border:      `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'var(--border-faint)'}`,
                color:       copied ? 'var(--accent)' : 'var(--txt-2)',
                cursor:      'pointer',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
        <div className="text-[12px] mt-3 leading-relaxed" style={{ color: 'var(--txt-4)' }}>
          Share this code with the girls in your cohort. When they register, they enter this code to be linked to you. You can see their progress on the{' '}
          <span style={{ color: 'var(--txt-2)' }}>My Girls</span> page.
        </div>
      </div>

      {/* Account details */}
      <div className="text-[13px] font-semibold mb-4" style={{ color: 'var(--txt-1)' }}>Account Details</div>

      {error && (
        <div className="text-[12.5px] px-4 py-3 rounded-lg mb-4"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-txt)' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="text-[12.5px] px-4 py-3 rounded-lg mb-4"
          style={{ background: 'var(--border)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}>
          Changes saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Full name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            required autoComplete="name" style={inputStyle}
          />
        </div>

        <div className="mb-5">
          <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Email address</label>
          <input
            type="email" value={user.email} readOnly
            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
          />
          <div className="text-[10.5px] mt-1" style={{ color: 'var(--txt-4)' }}>
            Email cannot be changed.
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-[11.5px] mb-2" style={{ color: 'var(--txt-3)' }}>Role</label>
          <input
            type="text" value="Facilitator" readOnly
            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving || name.trim() === user.name}
          className="px-6 py-[10px] rounded-[9px] text-[13px] font-semibold transition-opacity"
          style={{
            background: 'var(--accent-gradient)',
            color: '#09160d',
            border: 'none',
            cursor: saving || name.trim() === user.name ? 'not-allowed' : 'pointer',
            opacity: saving || name.trim() === user.name ? 0.5 : 1,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {/* Account info */}
      <div className="mt-8 rounded-[12px] p-4" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-faint)' }}>
        <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'var(--txt-4)' }}>Account Info</div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12px]">
            <span style={{ color: 'var(--txt-3)' }}>Account created</span>
            <span style={{ color: 'var(--txt-2)' }}>
              {new Date(user.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          {user.lastLoginAt && (
            <div className="flex justify-between text-[12px]">
              <span style={{ color: 'var(--txt-3)' }}>Last login</span>
              <span style={{ color: 'var(--txt-2)' }}>
                {new Date(user.lastLoginAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

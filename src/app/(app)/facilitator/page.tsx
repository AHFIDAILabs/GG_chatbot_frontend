'use client';

import { useAuth } from '../../../hooks';
import { useRouter } from 'next/navigation';

export default function MyFacilitatorPage() {
  const { user } = useAuth();
  const router   = useRouter();

  if (user?.role === 'facilitator') {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-3">
        <div className="text-[28px]">👩‍🏫</div>
        <div className="text-[13px]" style={{ color: 'var(--txt-3)' }}>
          You are a facilitator.{' '}
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
            Go to your portal →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 max-w-[480px] mx-auto">
      <div className="mb-6">
        <div className="text-[18px] font-bold mb-1" style={{ color: 'var(--txt-1)' }}>My Facilitator</div>
        <div className="text-[13px]" style={{ color: 'var(--txt-3)' }}>
          Your learning support contact.
        </div>
      </div>

      {user?.facilitatorId ? (
        <div
          className="rounded-[14px] p-5"
          style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-strong)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center font-bold text-[22px] shrink-0"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', boxShadow: '0 0 18px rgba(74,222,128,0.1)' }}
            >
              👩‍🏫
            </div>
            <div>
              <div className="text-[15px] font-bold" style={{ color: 'var(--txt-1)' }}>{user.facilitatorName ?? 'Your Facilitator'}</div>
              <div className="text-[12px] mt-1" style={{ color: 'var(--txt-3)' }}>
                Your facilitator can view your progress and support your learning journey.
              </div>
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded-[9px] text-[12px] leading-relaxed"
            style={{ background: 'var(--surface-raised)', color: 'var(--txt-3)' }}
          >
            If you need to speak to your facilitator directly, reach out through your school or program coordinator.
          </div>
        </div>
      ) : (
        <div
          className="rounded-[14px] p-5"
          style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          <div className="text-[13px] font-medium mb-2" style={{ color: '#fbbf24' }}>No facilitator assigned yet</div>
          <div className="text-[12px] leading-relaxed" style={{ color: 'var(--txt-3)' }}>
            A facilitator will be assigned to your account shortly. They will be able to view your progress and provide support on your learning journey.
          </div>
        </div>
      )}
    </div>
  );
}

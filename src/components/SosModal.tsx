'use client';

interface SOSModalProps {
  show:    boolean;
  onClose: () => void;
}

export default function SOSModal({ show, onClose }: SOSModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[999] p-5"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative max-w-[400px] w-full rounded-2xl p-[26px]"
        style={{
          background: 'var(--surface)',
          border:     '1px solid var(--border-input)',
          boxShadow:  '0 28px 70px rgba(0,0,0,0.65)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-[13px] right-[13px] w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px]"
          style={{
            background:  'var(--surface-raised)',
            border:      '1px solid var(--border-faint)',
            color:       'var(--txt-3)',
          }}
        >
          ✕
        </button>

        <div className="text-[36px] mb-3">🆘</div>
        <h3 className="text-[17px] font-bold mb-2" style={{ color: 'var(--txt-1)' }}>Need urgent help?</h3>
        <p className="text-[13px] mb-4 leading-relaxed" style={{ color: 'var(--txt-3)' }}>
          If you are in danger, being hurt, or feeling unsafe — reach out right now:
        </p>

        {[
          { title: 'GGCL Safeguarding',   info: 'Speak to your nearest facilitator immediately' },
          { title: 'Nigeria Emergency',    info: 'Call 112 — free from any phone' },
          { title: 'Child Helpline Nigeria', info: '0800-CHILD-0 (0800-24453-0)' },
        ].map(item => (
          <div
            key={item.title}
            className="rounded-lg px-3 py-[10px] mb-2"
            style={{
              background:  'var(--surface-hover)',
              border:      '1px solid var(--accent-dim)',
            }}
          >
            <div className="font-bold text-[12.5px] mb-[2px]" style={{ color: 'var(--accent)' }}>
              {item.title}
            </div>
            <div className="text-[12px]" style={{ color: 'var(--txt-3)' }}>
              {item.info}
            </div>
          </div>
        ))}

        <p className="text-[12px] text-center mt-2 italic" style={{ color: 'var(--accent)' }}>
          You are brave for seeking help. You deserve to be safe. 💚
        </p>
      </div>
    </div>
  );
}

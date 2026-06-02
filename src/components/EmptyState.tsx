"use client";

const QUICK_CHIPS = [
  "Why do I get cramps during my period?",
  "How do I stay safe online?",
  "How do I start saving money?",
];

interface EmptyStateProps {
  onChipClick: (text: string) => void;
}

export default function EmptyState({ onChipClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-7">
      <div className="text-[52px]">🌸</div>

      <h2 className="text-[22px] font-bold" style={{ color: 'var(--txt-1)' }}>Hi! I am Amara.</h2>

      <p
        className="text-[14px] max-w-[340px] leading-[1.7]"
        style={{ color: 'var(--txt-3)' }}
      >
        Your safe space to ask anything — periods, puberty, digital skills,
        money, the environment, or life skills. No question is too small.
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-[440px] mt-1">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => onChipClick(chip)}
            className="px-[14px] py-[7px] rounded-2xl text-[12px] border transition-all duration-150"
            style={{
              background:  'var(--surface-raised)',
              borderColor: 'var(--border-input)',
              color:       'var(--txt-2)',
              fontFamily:  'DM Sans, sans-serif',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background  = 'var(--surface-active)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background  = 'var(--surface-raised)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-input)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'var(--txt-2)';
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      <p
        className="text-[10.5px] mt-1"
        style={{ color: 'var(--txt-4)' }}
      >
        All conversations are private and confidential
      </p>
    </div>
  );
}

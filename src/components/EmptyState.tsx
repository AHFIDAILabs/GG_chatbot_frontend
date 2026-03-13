'use client';

const QUICK_CHIPS = [
  'Why do I get cramps during my period?',
  'How do I stay safe online?',
  'How do I start saving money?',
];

interface EmptyStateProps {
  onChipClick: (text: string) => void;
}

export default function EmptyState({ onChipClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-7">
      <div className="text-[52px]">🌸</div>

      <h2 className="text-[22px] font-bold text-white">Hi! I'm Amara.</h2>

      <p className="text-[14px] max-w-[340px] leading-[1.7]" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Your safe space to ask anything — periods, puberty, digital skills,
        money, the environment, or life skills. No question is too small.
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-[440px] mt-1">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => onChipClick(chip)}
            className="px-[14px] py-[7px] rounded-2xl text-[12px] border transition-all duration-150"
            style={{
              background:  'rgba(74,222,128,0.07)',
              borderColor: 'rgba(74,222,128,0.16)',
              color:       'rgba(255,255,255,0.65)',
              fontFamily:  'DM Sans, sans-serif',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background  = 'rgba(74,222,128,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color       = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background  = 'rgba(74,222,128,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color       = 'rgba(255,255,255,0.65)';
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      <p className="text-[10.5px] mt-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
        All conversations are private and confidential
      </p>
    </div>
  );
}
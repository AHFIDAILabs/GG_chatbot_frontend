'use client';

import { useState }       from 'react';
import { useTracker }     from '../../../hooks';
import StatsRow           from '../../../components/Statsrows';
import Calendar           from '../../../components/Calendar';
import SymptomsPanel      from '../../../components/SymptomsPanel';
import InsightsPanel      from '../../../components/InsightPanel';
import LogPeriodModal     from '../../../components/LogPeriodModal';
import { MoodType }       from '../../../types';

type Tab = 'calendar' | 'log' | 'symptoms' | 'insights';

const TABS: { key: Tab; label: string }[] = [
  { key: 'calendar', label: '📅 Calendar'  },
  { key: 'log',      label: '📋 Cycle Log' },
  { key: 'symptoms', label: '🩺 Symptoms'  },
  { key: 'insights', label: '💡 Insights'  },
];

export default function TrackerPage() {
  const [activeTab,   setActiveTab]   = useState<Tab>('calendar');
  const [showLogModal, setShowLogModal] = useState(false);

  const {
    periodLogs,
    symptomLogs,
    stats,
    calendar,
    addPeriodLog,
    removePeriodLog,
    addSymptomLog,
  } = useTracker();

  const pageInnerStyle: React.CSSProperties = {
    flex:      1,
    overflowY: 'auto',
    padding:   '24px 22px',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding:     '7px 14px',
    borderRadius: 8,
    fontSize:    12.5,
    cursor:      'pointer',
    border:      `1px solid ${active ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
    background:  active ? 'rgba(74,222,128,0.1)'  : 'rgba(255,255,255,0.04)',
    color:       active ? '#4ade80'               : 'rgba(255,255,255,0.45)',
    fontFamily:  'DM Sans, sans-serif',
    transition:  'all 0.15s',
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div style={pageInnerStyle}>
        <div className="text-[20px] font-bold text-white mb-1">Period Tracker</div>
        <div className="text-[12.5px] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Track your cycle, moods, symptoms and insights
        </div>

        {/* Log button */}
        <button
          onClick={() => setShowLogModal(true)}
          className="block w-full py-[11px] rounded-[9px] font-bold text-[13.5px] mb-4 border-none transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg,#4ade80,#16a34a)',
            color:      '#09160d',
            fontFamily: 'DM Sans, sans-serif',
            cursor:     'pointer',
          }}
        >
          + Log Period
        </button>

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={tabStyle(activeTab === tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar panel */}
        {activeTab === 'calendar' && (
          <Calendar dateSets={calendar} />
        )}

        {/* Cycle log panel */}
        {activeTab === 'log' && (
          <div
            className="rounded-[11px] p-4"
            style={{ background: 'rgba(13,30,17,0.85)', border: '1px solid rgba(74,222,128,0.1)' }}
          >
            <div className="text-[9.5px] tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              All Period Logs
            </div>

            {periodLogs.length === 0 ? (
              <div className="text-center py-5 text-[13px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                No periods logged yet. Tap "+ Log Period" to start.
              </div>
            ) : (
              [...periodLogs]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-[9px]"
                    style={{ borderBottom: '1px solid rgba(74,222,128,0.07)' }}
                  >
                    <div className="flex items-center gap-[9px]">
                      <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: '#f87171' }} />
                      <div>
                        <div className="text-[13px] font-semibold text-white">
                          {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] mt-[1px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {log.flow} flow · {log.duration} days{log.notes ? ` · ${log.notes}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: '#4ade80' }}>
                        {log.duration}d
                      </span>
                      <button
                        onClick={() => removePeriodLog(log.id)}
                        className="text-[13px] px-[6px] py-[2px]"
                        style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.4)', cursor: 'pointer' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.4)')}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Symptoms panel */}
        {activeTab === 'symptoms' && (
          <SymptomsPanel
            symptomLogs={symptomLogs}
            onSave={(mood: MoodType | null, symptoms: string[]) => {
              const today = new Date().toISOString().split('T')[0];
              addSymptomLog(today, mood, symptoms);
            }}
          />
        )}

        {/* Insights panel */}
        {activeTab === 'insights' && (
          <InsightsPanel stats={stats} periodLogs={periodLogs} />
        )}
      </div>

      <LogPeriodModal
        show={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSave={(date, flow, duration, notes) => {
          addPeriodLog(date, flow, duration, notes);
          setShowLogModal(false);
        }}
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import { useTracker } from "../../../hooks";
import StatsRow from "../../../components/Statsrows";
import Calendar from "../../../components/Calendar";
import SymptomsPanel from "../../../components/SymptomsPanel";
import InsightsPanel from "../../../components/InsightPanel";
import LogPeriodModal from "../../../components/LogPeriodModal";
import { MoodType } from "../../../types";

type Tab = "calendar" | "log" | "symptoms" | "insights";

const TABS: { key: Tab; label: string }[] = [
  { key: "calendar", label: "📅 Calendar" },
  { key: "log", label: "📋 Cycle Log" },
  { key: "symptoms", label: "🩺 Symptoms" },
  { key: "insights", label: "💡 Insights" },
];

export default function TrackerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const [showLogModal, setShowLogModal] = useState(false);

  const {
    periodLogs,
    symptomLogs,
    stats,
    calendar,
    prediction,
    addPeriodLog,
    removePeriodLog,
    addSymptomLog,
  } = useTracker();

  const pageInnerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "24px 22px",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 8,
    fontSize: 12.5,
    cursor: "pointer",
    border: `1px solid ${active ? "var(--border-strong)" : "var(--border-faint)"}`,
    background: active ? "var(--surface-active)" : "var(--surface-input)",
    color: active ? "var(--accent)" : "var(--txt-3)",
    fontFamily: "DM Sans, sans-serif",
    transition: "all 0.15s",
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div style={pageInnerStyle}>
        <div className="text-[20px] font-bold mb-1" style={{ color: "var(--txt-1)" }}>
          Period Tracker
        </div>
        <div
          className="text-[12.5px] mb-4"
          style={{ color: "var(--txt-4)" }}
        >
          Track your cycle, moods, symptoms and insights
        </div>

        {/* Log button */}
        <button
          onClick={() => setShowLogModal(true)}
          className="block w-full py-[11px] rounded-[9px] font-bold text-[13.5px] mb-4 border-none transition-opacity hover:opacity-90"
          style={{
            background: "var(--accent-gradient)",
            color: "#ffffff",
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
          }}
        >
          + &apos;Log Period
        </button>

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Backend cycle prediction card */}
        {prediction && (
          <div
            className="rounded-[11px] p-4 mb-4"
            style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-input)' }}
          >
            <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
              AI Cycle Prediction · based on {prediction.basedOnCycles} cycle{prediction.basedOnCycles !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-4 flex-wrap">
              <div>
                <div className="text-[11px]" style={{ color: 'var(--txt-3)' }}>Next Period</div>
                <div className="text-[14px] font-semibold" style={{ color: 'var(--txt-1)' }}>
                  {new Date(prediction.nextStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  {' – '}
                  {new Date(prediction.nextEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div>
                <div className="text-[11px]" style={{ color: 'var(--txt-3)' }}>Avg Cycle</div>
                <div className="text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>{prediction.avgCycleLength} days</div>
              </div>
              <div>
                <div className="text-[11px]" style={{ color: 'var(--txt-3)' }}>Avg Duration</div>
                <div className="text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>{prediction.avgDuration} days</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map((tab) => (
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
        {activeTab === "calendar" && <Calendar dateSets={calendar} />}

        {/* Cycle log panel */}
        {activeTab === "log" && (
          <div
            className="rounded-[11px] p-4"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border-faint)",
            }}
          >
            <div
              className="text-[9.5px] tracking-widest uppercase mb-3"
              style={{ color: "var(--txt-4)" }}
            >
              All Period Logs
            </div>

        {periodLogs.length === 0 ? (
  <div
    className="text-center py-5 text-[13px]"
    style={{ color: "var(--txt-4)" }}
  >
    No periods logged yet. Tap + Log Periods to start.
  </div>) : (
              [...periodLogs]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-[9px]"
                    style={{ borderBottom: "1px solid var(--border-faint)" }}
                  >
                    <div className="flex items-center gap-[9px]">
                      <div
                        className="w-[9px] h-[9px] rounded-full shrink-0"
                        style={{ background: "#f87171" }}
                      />
                      <div>
                        <div className="text-[13px] font-semibold" style={{ color: "var(--txt-1)" }}>
                          {new Date(log.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div
                          className="text-[11px] mt-[1px]"
                          style={{ color: "var(--txt-4)" }}
                        >
                          {log.flow} flow · {log.duration} days
                          {log.notes ? ` · ${log.notes}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        {log.duration}d
                      </span>
                      <button
                        onClick={() => removePeriodLog(log.id)}
                        className="text-[13px] px-[6px] py-[2px]"
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(239,68,68,0.4)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color =
                            "#f87171")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(239,68,68,0.4)")
                        }
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
        {activeTab === "symptoms" && (
          <SymptomsPanel
            symptomLogs={symptomLogs}
            onSave={(mood: MoodType | null, symptoms: string[]) => {
              const today = new Date().toISOString().split("T")[0];
              addSymptomLog(today, mood, symptoms);
            }}
          />
        )}

        {/* Insights panel */}
        {activeTab === "insights" && (
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

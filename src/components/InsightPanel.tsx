"use client";

import { TrackerStats, PeriodLog } from "../types";

interface InsightsPanelProps {
  stats: TrackerStats;
  periodLogs: PeriodLog[];
}

export default function InsightsPanel({
  stats,
  periodLogs,
}: InsightsPanelProps) {
  const cardStyle: React.CSSProperties = {
    background: "rgba(74,222,128,0.05)",
    border: "1px solid rgba(74,222,128,0.12)",
    borderRadius: 9,
    padding: "12px 14px",
    marginBottom: 10,
  };

  if (periodLogs.length === 0) {
    return (
      <div style={cardStyle}>
        <div className="text-[18px] mb-[5px]">📊</div>
        <div
          className="text-[12.5px] font-bold mb-[2px]"
          style={{ color: "#4ade80" }}
        >
          No data yet
        </div>
        <div
          className="text-[12px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Log at least one period to start seeing personalised insights about
          your cycle.
        </div>
      </div>
    );
  }

  const insights = buildInsights(stats, periodLogs);

  return (
    <>
      {insights.map((ins, i) => (
        <div key={i} style={cardStyle}>
          <div className="text-[18px] mb-[5px]">{ins.icon}</div>
          <div
            className="text-[12.5px] font-bold mb-[2px]"
            style={{ color: "#4ade80" }}
          >
            {ins.title}
          </div>
          <div
            className="text-[12px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {ins.text}
          </div>
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Insight builder
// ─────────────────────────────────────────────

interface Insight {
  icon: string;
  title: string;
  text: string;
}

function buildInsights(stats: TrackerStats, logs: PeriodLog[]): Insight[] {
  const insights: Insight[] = [];

  // Cycle regularity
  if (stats.logsCount >= 2) {
    const regular = stats.avgCycleLength >= 21 && stats.avgCycleLength <= 35;
    insights.push({
      icon: regular ? "✅" : "⚠️",
      title: "Cycle regularity",
      text: regular
        ? `Your average cycle of ${stats.avgCycleLength} days is within the normal range of 21–35 days. Great tracking!`
        : `Your average cycle is ${stats.avgCycleLength} days. Cycles outside 21–35 days can vary naturally, especially in the first few years. If you're concerned, speak to a health worker.`,
    });
  }

  // Next period reminder
  if (stats.nextPeriodDays !== null) {
    const days = stats.nextPeriodDays;
    insights.push({
      icon: "📅",
      title: "Next period",
      text:
        days <= 0
          ? "Your period may be starting around now. Make sure you have pads or other supplies ready!"
          : days <= 5
            ? `Your period is expected in about ${days} day${days !== 1 ? "s" : ""}. It's a good time to prepare your supplies.`
            : `Your next period is predicted in ${days} days (around ${new Date(stats.nextPeriodDate!).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}).`,
    });
  }

  // Phase info
  const phaseInfo: Record<string, string> = {
    Menstrual:
      "You are likely in your menstrual phase. Rest when you need to, stay hydrated, and use heat for cramps.",
    Follicular:
      "You are in your follicular phase — energy often increases during this time. A great time to try new activities!",
    Ovulatory:
      "You may be in your ovulatory phase. Some people feel their most energetic around this time.",
    Luteal:
      "You are in your luteal phase. It's normal to feel more tired or experience mood changes. Be kind to yourself.",
  };

  if (stats.currentPhase !== "Unknown" && phaseInfo[stats.currentPhase]) {
    insights.push({
      icon: "🔄",
      title: `${stats.currentPhase} phase`,
      text: phaseInfo[stats.currentPhase],
    });
  }

  // Period length
  if (stats.logsCount >= 1) {
    const normal = stats.avgPeriodLength >= 2 && stats.avgPeriodLength <= 7;
    insights.push({
      icon: "💧",
      title: "Period duration",
      text: normal
        ? `Your average period lasts ${stats.avgPeriodLength} days, which is within the typical range of 2–7 days.`
        : `Your average period lasts ${stats.avgPeriodLength} days. Periods outside 2–7 days are worth mentioning to a health worker.`,
    });
  }

  // Encouragement
  insights.push({
    icon: "💚",
    title: "Keep tracking",
    text: `You have logged ${stats.logsCount} period${stats.logsCount !== 1 ? "s" : ""}. The more you track, the better Amara can help you understand your body. You are doing great!`,
  });

  return insights;
}

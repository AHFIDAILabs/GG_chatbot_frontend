"use client";

import { useState } from "react";
import { FlowIntensity } from "../types";

interface LogPeriodModalProps {
  show:    boolean;
  onClose: () => void;
  onSave:  (date: string, flow: FlowIntensity, duration: number, notes: string) => void;
}

const FLOW_OPTIONS: { value: FlowIntensity; label: string; emoji: string }[] = [
  { value: "light",  label: "Light",  emoji: "💧" },
  { value: "medium", label: "Medium", emoji: "🩸" },
  { value: "heavy",  label: "Heavy",  emoji: "🔴" },
];

export default function LogPeriodModal({ show, onClose, onSave }: LogPeriodModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [date,     setDate]     = useState(today);
  const [flow,     setFlow]     = useState<FlowIntensity>("medium");
  const [duration, setDuration] = useState(5);
  const [notes,    setNotes]    = useState("");

  if (!show) return null;

  const handleSave = () => {
    if (!date) return;
    onSave(date, flow, duration, notes);
    setDate(today);
    setFlow("medium");
    setDuration(5);
    setNotes("");
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width:      "100%",
    padding:    "9px 11px",
    borderRadius: 8,
    background: "var(--surface-input)",
    border:     "1px solid var(--border-input)",
    color:      "var(--txt-1)",
    fontSize:   13.5,
    fontFamily: "DM Sans, sans-serif",
    outline:    "none",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[999] p-5"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative max-w-[400px] w-full rounded-2xl p-[26px]"
        style={{
          background: "var(--surface)",
          border:     "1px solid var(--border-input)",
          boxShadow:  "0 28px 70px rgba(0,0,0,0.35)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-[13px] right-[13px] w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px]"
          style={{
            background: "var(--surface-alt)",
            border:     "1px solid var(--border)",
            color:      "var(--txt-3)",
          }}
        >
          ✕
        </button>

        <div className="text-[17px] font-bold mb-4" style={{ color: "var(--txt-1)" }}>
          📅 Log Your Period
        </div>

        <div className="text-[11.5px] mb-[5px]" style={{ color: "var(--txt-4)" }}>Start date</div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={inputStyle}
        />

        <div className="text-[11.5px] mt-3 mb-[5px]" style={{ color: "var(--txt-4)" }}>Flow intensity</div>
        <div className="flex gap-2">
          {FLOW_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFlow(opt.value)}
              className="flex-1 py-2 rounded-[7px] text-[12px] border transition-all duration-150"
              style={{
                background:  flow === opt.value ? "var(--accent-dim)"    : "var(--surface-input)",
                borderColor: flow === opt.value ? "var(--border-strong)" : "var(--border)",
                color:       flow === opt.value ? "var(--accent)"        : "var(--txt-3)",
                fontFamily:  "DM Sans, sans-serif",
              }}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        <div className="text-[11.5px] mt-3 mb-[5px]" style={{ color: "var(--txt-4)" }}>Duration (days)</div>
        <input
          type="number"
          min={1}
          max={10}
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          style={inputStyle}
        />

        <div className="text-[11.5px] mt-3 mb-[5px]" style={{ color: "var(--txt-4)" }}>Notes (optional)</div>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. mild cramps, felt tired…"
          style={inputStyle}
        />

        <button
          onClick={handleSave}
          className="w-full mt-[18px] py-[11px] rounded-[9px] text-[13.5px] font-bold border-none"
          style={{
            background: "var(--accent-gradient)",
            color:      "#ffffff",
            fontFamily: "DM Sans, sans-serif",
            cursor:     "pointer",
          }}
        >
          Save Log
        </button>
      </div>
    </div>
  );
}

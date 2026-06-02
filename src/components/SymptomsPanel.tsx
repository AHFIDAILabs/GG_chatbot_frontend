"use client";

import { useState } from "react";
import { MoodType, SymptomLog } from "../types";

const MOODS: { value: MoodType; emoji: string }[] = [
  { value: "Happy",     emoji: "😊" },
  { value: "Calm",      emoji: "😌" },
  { value: "Tired",     emoji: "😴" },
  { value: "Sad",       emoji: "😢" },
  { value: "Irritable", emoji: "😠" },
];

const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Back pain", "Fatigue",
  "Nausea", "Breast tenderness", "Mood swings", "Acne", "Cravings",
];

interface SymptomsPanelProps {
  symptomLogs: SymptomLog[];
  onSave: (mood: MoodType | null, symptoms: string[]) => void;
}

export default function SymptomsPanel({ symptomLogs, onSave }: SymptomsPanelProps) {
  const [selectedMood,     setSelectedMood]     = useState<MoodType | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym],
    );
  };

  const handleSave = () => {
    onSave(selectedMood, selectedSymptoms);
    setSelectedMood(null);
    setSelectedSymptoms([]);
  };

  const cardStyle: React.CSSProperties = {
    background:   'var(--surface-raised)',
    border:       '1px solid var(--border)',
    borderRadius: 11,
    padding:      16,
    marginBottom: 12,
  };

  return (
    <>
      {/* Log today */}
      <div style={cardStyle}>
        <div className="text-[9.5px] tracking-widest uppercase mb-3" style={{ color: 'var(--txt-4)' }}>
          How are you feeling today?
        </div>

        <div className="text-[12px] mb-2" style={{ color: 'var(--txt-3)' }}>Mood</div>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(prev => prev === m.value ? null : m.value)}
              className="py-2 px-1 rounded-lg text-center text-[11px] border transition-all duration-150"
              style={{
                background:  selectedMood === m.value ? 'var(--accent-dim)'    : 'var(--surface-input)',
                borderColor: selectedMood === m.value ? 'var(--border-strong)' : 'var(--border)',
                color:       selectedMood === m.value ? 'var(--txt-1)'         : 'var(--txt-3)',
                fontFamily:  'DM Sans, sans-serif',
              }}
            >
              <span className="block text-[20px] mb-[3px]">{m.emoji}</span>
              {m.value}
            </button>
          ))}
        </div>

        <div className="text-[12px] mt-4 mb-2" style={{ color: 'var(--txt-3)' }}>
          Symptoms (select all that apply)
        </div>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map(sym => (
            <button
              key={sym}
              onClick={() => toggleSymptom(sym)}
              className="px-3 py-[6px] rounded-2xl text-[12px] border transition-all duration-150"
              style={{
                background:  selectedSymptoms.includes(sym) ? 'var(--accent-dim)'    : 'var(--surface-input)',
                borderColor: selectedSymptoms.includes(sym) ? 'var(--border-strong)' : 'var(--border)',
                color:       selectedSymptoms.includes(sym) ? 'var(--accent)'        : 'var(--txt-3)',
                fontFamily:  'DM Sans, sans-serif',
              }}
            >
              {sym}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-5 py-[9px] rounded-lg font-bold text-[13px] border-none"
          style={{
            background: 'var(--accent-gradient)',
            color:      '#ffffff',
            fontFamily: 'DM Sans, sans-serif',
            cursor:     'pointer',
          }}
        >
          Save Your Log
        </button>
      </div>

      {/* Symptom history */}
      <div style={cardStyle}>
        <div className="text-[9.5px] tracking-widest uppercase mb-3" style={{ color: 'var(--txt-4)' }}>
          Symptom History
        </div>
        {symptomLogs.length === 0 ? (
          <p className="text-[12px]" style={{ color: 'var(--txt-4)' }}>
            No logs yet. Start tracking your symptoms above.
          </p>
        ) : (
          symptomLogs.slice(0, 10).map(log => (
            <div
              key={log.id}
              className="flex items-center justify-between py-[9px]"
              style={{ borderBottom: '1px solid var(--border-faint)' }}
            >
              <div>
                <div className="text-[13px] font-semibold" style={{ color: 'var(--txt-1)' }}>
                  {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  {log.mood && ` · ${MOODS.find(m => m.value === log.mood)?.emoji} ${log.mood}`}
                </div>
                <div className="text-[11px] mt-[2px]" style={{ color: 'var(--txt-3)' }}>
                  {log.symptoms.length > 0 ? log.symptoms.join(', ') : 'No symptoms logged'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

'use client';

import { useState }    from 'react';
import { useGoals }    from '../../../hooks';
import { GoalPillar, GoalStatus, Goal } from '../../../types';

const PILLAR_LABELS: Record<GoalPillar, string> = {
  menstrual_hygiene: '🩸 Menstrual Health',
  environment:       '🌿 Environment',
  digital_skills:    '💻 Digital Skills',
  life_skills:       '✨ Life Skills',
  personal:          '⭐ Personal',
};

const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done:        'Done',
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  not_started: 'rgba(255,255,255,0.3)',
  in_progress: '#fbbf24',
  done:        '#4ade80',
};

function GoalCard({
  goal,
  onToggleStep,
  onStatusChange,
  onDelete,
}: {
  goal:           Goal;
  onToggleStep:   (stepId: string, done: boolean) => void;
  onStatusChange: (status: GoalStatus) => void;
  onDelete:       () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const doneSteps = goal.steps.filter(s => s.done).length;

  return (
    <div
      className="rounded-[11px] p-4 mb-3"
      style={{ background: 'var(--surface-raised)', border: `1px solid ${goal.status === 'done' ? 'rgba(74,222,128,0.25)' : 'var(--border-faint)'}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold leading-snug" style={{ color: 'var(--txt-1)' }}>{goal.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10.5px]" style={{ color: 'var(--txt-4)' }}>
              {PILLAR_LABELS[goal.pillar]}
            </span>
            {goal.deadline && (
              <span className="text-[10.5px]" style={{ color: 'var(--txt-4)' }}>
                · Due {new Date(goal.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[10.5px] px-[7px] py-[2px] rounded-full"
            style={{ background: `${STATUS_COLORS[goal.status]}18`, color: STATUS_COLORS[goal.status], border: `1px solid ${STATUS_COLORS[goal.status]}33` }}
          >
            {STATUS_LABELS[goal.status]}
          </span>
          <button onClick={onDelete} className="text-[12px] opacity-30 hover:opacity-70 transition-opacity" style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      {/* Progress bar */}
      {goal.steps.length > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-[4px]" style={{ color: 'var(--txt-4)' }}>
            <span>{doneSteps}/{goal.steps.length} steps</span>
            <span>{Math.round((doneSteps / goal.steps.length) * 100)}%</span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border-faint)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(doneSteps / goal.steps.length) * 100}%`, background: 'var(--accent-gradient)' }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {goal.steps.length > 0 && (
        <div>
          {(expanded ? goal.steps : goal.steps.slice(0, 3)).map(step => (
            <label key={step._id} className="flex items-center gap-2 py-[5px] cursor-pointer group">
              <input
                type="checkbox"
                checked={step.done}
                onChange={e => onToggleStep(step._id, e.target.checked)}
                className="rounded accent-green-400 shrink-0"
              />
              <span className="text-[12.5px]" style={{ color: step.done ? 'rgba(74,222,128,0.6)' : 'var(--txt-2)', textDecoration: step.done ? 'line-through' : 'none' }}>
                {step.text}
              </span>
            </label>
          ))}
          {goal.steps.length > 3 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[11px] mt-1"
              style={{ background: 'none', border: 'none', color: 'rgba(74,222,128,0.6)', cursor: 'pointer' }}
            >
              {expanded ? 'Show less' : `+${goal.steps.length - 3} more steps`}
            </button>
          )}
        </div>
      )}

      {/* Quick status change */}
      {goal.status !== 'done' && (
        <button
          onClick={() => onStatusChange(goal.status === 'not_started' ? 'in_progress' : 'done')}
          className="mt-3 text-[11.5px] px-3 py-[5px] rounded-[6px] transition-opacity hover:opacity-80"
          style={{ background: 'var(--surface-active)', border: '1px solid var(--border-input)', color: 'var(--accent)', cursor: 'pointer' }}
        >
          {goal.status === 'not_started' ? 'Mark In Progress' : 'Mark Done'}
        </button>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const { goals, loading, saving, createGoal, updateGoal, toggleStep, deleteGoal } = useGoals();

  const [showForm,   setShowForm]   = useState(false);
  const [title,      setTitle]      = useState('');
  const [pillar,     setPillar]     = useState<GoalPillar>('personal');
  const [deadline,   setDeadline]   = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [filter,     setFilter]     = useState<GoalStatus | 'all'>('all');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const steps = stepsInput.split('\n').map(s => s.trim()).filter(Boolean);
    await createGoal(title.trim(), pillar, deadline || null, steps);
    setTitle(''); setPillar('personal'); setDeadline(''); setStepsInput('');
    setShowForm(false);
  };

  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-[22px]">
        <div className="text-[20px] font-bold mb-1" style={{ color: 'var(--txt-1)' }}>My Goals</div>
        <div className="text-[12.5px] mb-5" style={{ color: 'var(--txt-4)' }}>
          Track your SMART goals across all GGCL pillars
        </div>

        {/* Create button */}
        <button
          onClick={() => setShowForm(v => !v)}
          className="w-full py-[11px] rounded-[9px] font-bold text-[13.5px] mb-4 transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent-gradient)', color: '#09160d', border: 'none', cursor: 'pointer' }}
        >
          {showForm ? '✕ Cancel' : '+ New Goal'}
        </button>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="rounded-[11px] p-4 mb-4" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-strong)' }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Goal title…"
              required
              className="w-full bg-transparent border-b mb-3 pb-2 text-[13.5px] outline-none"
              style={{ borderColor: 'var(--border-strong)', color: '#e8f5ee', fontFamily: 'DM Sans, sans-serif' }}
            />
            <div className="flex gap-2 mb-3 flex-wrap">
              {(Object.keys(PILLAR_LABELS) as GoalPillar[]).map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setPillar(p)}
                  className="text-[11px] px-[9px] py-[4px] rounded-full transition-all"
                  style={{
                    background: pillar === p ? 'var(--accent-dim)' : 'var(--surface-input)',
                    border: `1px solid ${pillar === p ? 'rgba(74,222,128,0.3)' : 'var(--border-faint)'}`,
                    color: pillar === p ? 'var(--accent)' : 'var(--txt-3)',
                    cursor: 'pointer',
                  }}
                >
                  {PILLAR_LABELS[p]}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-transparent border-b mb-3 pb-2 text-[12.5px] outline-none"
              style={{ borderColor: 'var(--border-faint)', color: 'var(--txt-3)', fontFamily: 'DM Sans, sans-serif' }}
            />
            <textarea
              value={stepsInput}
              onChange={e => setStepsInput(e.target.value)}
              placeholder="Steps (one per line, optional)…"
              rows={3}
              className="w-full bg-transparent border-b mb-4 pb-2 text-[12.5px] outline-none resize-none"
              style={{ borderColor: 'var(--border-faint)', color: 'var(--txt-2)', fontFamily: 'DM Sans, sans-serif' }}
            />
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="w-full py-[9px] rounded-[7px] font-semibold text-[13px]"
              style={{ background: 'var(--accent-gradient)', color: '#09160d', border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : 'Create Goal'}
            </button>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'not_started', 'in_progress', 'done'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="text-[11.5px] px-[10px] py-[5px] rounded-[7px] transition-all"
              style={{
                background: filter === s ? 'var(--surface-active)' : 'var(--surface-input)',
                border: `1px solid ${filter === s ? 'var(--border-strong)' : 'var(--border-faint)'}`,
                color: filter === s ? 'var(--accent)' : 'var(--txt-3)',
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s as GoalStatus]}
              <span className="ml-1 opacity-60">
                ({s === 'all' ? goals.length : goals.filter(g => g.status === s).length})
              </span>
            </button>
          ))}
        </div>

        {/* Goal list */}
        {loading ? (
          <div className="text-center py-10 text-[13px]" style={{ color: 'var(--txt-4)' }}>Loading goals…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-[13px]" style={{ color: 'var(--txt-4)' }}>
            {filter === 'all' ? 'No goals yet. Create your first goal above!' : `No ${STATUS_LABELS[filter as GoalStatus]} goals.`}
          </div>
        ) : (
          filtered.map(goal => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onToggleStep={(stepId, done) => toggleStep(goal._id, stepId, done)}
              onStatusChange={status => updateGoal(goal._id, { status })}
              onDelete={() => deleteGoal(goal._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

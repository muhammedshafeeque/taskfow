import { useState } from 'react';

interface WorkLogInputProps {
  onAdd: (payload: { minutesSpent: number; date: string; description?: string }) => void;
  submitting: boolean;
}

export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/);
  let totalMinutes = 0;

  for (const token of tokens) {
    const m = token.match(/^([0-9]*\.?[0-9]+)([dhm])$/i);
    if (!m) return null;
    const value = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    if (Number.isNaN(value) || value <= 0) return null;
    if (unit === 'd') {
      totalMinutes += value * 8 * 60;
    } else if (unit === 'h') {
      totalMinutes += value * 60;
    } else if (unit === 'm') {
      totalMinutes += value;
    }
  }

  return Math.round(totalMinutes);
}

export function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const minutes = totalMinutes % 60;
  let hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 8);
  hours = hours % 8;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(' ');
}

export default function WorkLogInput({ onAdd, submitting }: WorkLogInputProps) {
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const minutes = parseDuration(duration);
    if (!minutes) {
      setError('Enter time like 1h 30m, 2d, 45m, 2.5h');
      return;
    }
    setError(null);
    onAdd({
      minutesSpent: minutes,
      date,
      description: description.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">
            Time spent
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 2h 30m, 1d, 45m"
            className="w-full px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-xs placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40"
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What did you work on?"
          className="w-full px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-xs placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40 resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] font-medium hover:bg-[color:var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Adding…' : 'Add work log'}
        </button>
      </div>
    </form>
  );
}


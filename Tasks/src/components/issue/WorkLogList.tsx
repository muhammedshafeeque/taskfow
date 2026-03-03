import type { WorkLog } from '../../lib/api';
import { formatMinutes } from './WorkLogInput';

interface WorkLogListProps {
  logs: WorkLog[];
  currentUserId?: string;
  onDelete: (id: string) => void;
}

export default function WorkLogList({ logs, currentUserId, onDelete }: WorkLogListProps) {
  if (logs.length === 0) {
    return <p className="text-[color:var(--text-muted)] text-xs py-4">No work logged yet.</p>;
  }

  const totalMinutes = logs.reduce((sum, l) => sum + (l.minutesSpent ?? 0), 0);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
        <span>Total time logged</span>
        <span className="font-medium text-[color:var(--text-primary)]">{formatMinutes(totalMinutes)}</span>
      </div>
      <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {logs.map((log) => {
          const canDelete = currentUserId && log.author?._id === currentUserId;
          return (
            <li
              key={log._id}
              className="rounded-lg bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] px-3 py-2 text-xs flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-[color:var(--text-primary)] truncate">
                      {log.author?.name ?? 'Unknown'}
                    </span>
                    <span className="text-[10px] text-[color:var(--text-muted)]">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[color:var(--text-primary)]">
                    {formatMinutes(log.minutesSpent)}
                  </span>
                </div>
                {log.description && (
                  <p className="mt-1 text-[11px] text-[color:var(--text-primary)] whitespace-pre-wrap break-words">
                    {log.description}
                  </p>
                )}
              </div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(log._id)}
                  className="text-[10px] text-[color:var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded px-1.5 py-0.5 transition-colors"
                >
                  Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}


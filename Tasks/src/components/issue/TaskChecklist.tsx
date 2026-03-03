import type { Issue } from '../../lib/api';

interface TaskChecklistProps {
  issue: Issue;
  newChecklistText: string;
  addingChecklist: boolean;
  onNewChecklistTextChange: (value: string) => void;
  onAddChecklistItem: () => void;
  onToggleChecklistItem: (itemId: string) => void;
  onRemoveChecklistItem: (itemId: string) => void;
  onSetAddingChecklist: (value: boolean) => void;
}

export default function TaskChecklist({
  issue,
  newChecklistText,
  addingChecklist,
  onNewChecklistTextChange,
  onAddChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
  onSetAddingChecklist,
}: TaskChecklistProps) {
  const checklist = issue.checklist ?? [];
  const checklistDone = checklist.filter((i) => i.done).length;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-[color:var(--text-muted)] uppercase tracking-wider mb-2">
        Checklist
      </h2>
      <div className="rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[color:var(--border-subtle)] flex items-center justify-between">
          <span className="text-xs text-[color:var(--text-muted)]">
            Progress ({checklistDone}/{checklist.length})
          </span>
          {checklist.length > 0 && (
            <div className="w-24 h-1.5 bg-[color:var(--bg-page)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[color:var(--text-primary)] rounded-full transition-all"
                style={{
                  width: checklist.length ? `${(checklistDone / checklist.length) * 100}%` : '0%',
                }}
              />
            </div>
          )}
        </div>
        <ul className="p-2 divide-y divide-[color:var(--border-subtle)]/70">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2 px-2 group">
              <button
                type="button"
                onClick={() => onToggleChecklistItem(item.id)}
                className="shrink-0 w-5 h-5 rounded border border-[color:var(--border-subtle)] flex items-center justify-center hover:border-[color:var(--accent)] transition"
              >
                {item.done ? <span className="text-[color:var(--text-primary)] text-xs">✓</span> : null}
              </button>
              <span
                className={`flex-1 text-xs ${
                  item.done ? 'text-[color:var(--text-muted)] line-through' : 'text-[color:var(--text-primary)]'
                }`}
              >
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => onRemoveChecklistItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-[color:var(--text-muted)] hover:text-red-400 transition"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {addingChecklist ? (
          <div className="p-3 border-t border-[color:var(--border-subtle)] flex gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => onNewChecklistTextChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAddChecklistItem()}
              placeholder="New item…"
              className="flex-1 px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40"
              autoFocus
            />
            <button
              type="button"
              onClick={onAddChecklistItem}
              className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                onSetAddingChecklist(false);
                onNewChecklistTextChange('');
              }}
              className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="p-2 border-t border-[color:var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onSetAddingChecklist(true)}
              className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
            >
              + New item
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

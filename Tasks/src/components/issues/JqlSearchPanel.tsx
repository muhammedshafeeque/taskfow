interface ProjectSnippet {
  key: string;
  name?: string;
}

interface JqlSearchPanelProps {
  jqlOpen: boolean;
  jqlInput: string;
  jqlError: string | null;
  useJql: boolean;
  jqlHelpOpen: boolean;
  setJqlInput: (v: string | ((prev: string) => string)) => void;
  setJqlError: (v: string | null) => void;
  setJqlHelpOpen: (fn: (o: boolean) => boolean) => void;
  updateUrl: (updates: { jql?: string; page?: number }) => void;
  projects?: ProjectSnippet[];
  onSaveAsFilter?: () => void;
}

export function JqlSearchPanel({
  jqlOpen,
  jqlInput,
  jqlError,
  useJql,
  jqlHelpOpen,
  setJqlInput,
  setJqlError,
  setJqlHelpOpen,
  updateUrl,
  projects = [],
  onSaveAsFilter,
}: JqlSearchPanelProps) {
  if (!jqlOpen) return null;

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 py-2 px-3 rounded-lg border ${
        jqlError ? 'bg-red-500/5 border-red-400/50' : 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)]'
      }`}>
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="text"
            value={jqlInput}
            onChange={(e) => { setJqlInput(e.target.value); setJqlError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && updateUrl({ jql: jqlInput.trim(), page: 1 })}
            placeholder='project = PROJ AND status = Done OR assignee = me, order by created DESC'
            className={`w-full px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border text-xs text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-1 ${
              jqlError ? 'border-red-400 focus:ring-red-400/40' : 'border-[color:var(--border-subtle)] focus:ring-[color:var(--accent)]/40'
            }`}
          />
          {jqlError && (
            <div className="flex flex-wrap items-center gap-2 px-1">
              <p className="text-xs text-red-500">{jqlError}</p>
              <button
                type="button"
                onClick={() => setJqlHelpOpen((o) => !o)}
                className="text-xs text-[color:var(--accent)] hover:underline"
              >
                See JQL help
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          <select
            title="Insert JQL snippet"
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                setJqlInput((prev) => (prev ? `${prev} ${v}` : v));
                e.target.value = '';
              }
            }}
            className="px-2 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40"
          >
            <option value="">Snippets…</option>
            <option value="status = Done">status = Done</option>
            <option value="assignee = me">assignee = me</option>
            {projects.map((p) => (
              <option key={p.key} value={`project = ${p.key}`}>
                project = {p.key}
              </option>
            ))}
            <option value="type = Bug">type = Bug</option>
            <option value="priority = High">priority = High</option>
            <option value="order by created DESC">order by created DESC</option>
            <option value="order by updated DESC">order by updated DESC</option>
          </select>
          <button
            type="button"
            onClick={() => updateUrl({ jql: jqlInput.trim(), page: 1 })}
            className="px-3 py-1.5 rounded-md bg-[color:var(--accent)] text-white text-xs font-medium hover:opacity-90"
          >
            Run
          </button>
          {useJql && (
            <button
              type="button"
              onClick={() => { updateUrl({ jql: '', page: 1 }); setJqlInput(''); setJqlError(null); }}
              className="px-2 py-1.5 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
            >
              Clear
            </button>
          )}
          {useJql && onSaveAsFilter && (
            <button
              type="button"
              onClick={onSaveAsFilter}
              className="px-2 py-1.5 text-xs text-[color:var(--accent)] hover:underline"
            >
              Save as filter
            </button>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] overflow-hidden">
        <button
          type="button"
          onClick={() => setJqlHelpOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-page)]"
        >
          <span>JQL help</span>
          <span className="text-[10px]">{jqlHelpOpen ? '▲' : '▼'}</span>
        </button>
        {jqlHelpOpen && (
          <div className="px-3 pb-3 pt-0 text-[11px] text-[color:var(--text-muted)] space-y-2 border-t border-[color:var(--border-subtle)]">
            <div>
              <span className="font-medium text-[color:var(--text-primary)]">Fields:</span>{' '}
              project, status, assignee, type, priority, sprint, labels, key, created, updated
            </div>
            <div>
              <span className="font-medium text-[color:var(--text-primary)]">Operators:</span>{' '}
              <code className="px-1 rounded bg-[color:var(--bg-page)]">=</code>,{' '}
              <code className="px-1 rounded bg-[color:var(--bg-page)]">in (...)</code>,{' '}
              <code className="px-1 rounded bg-[color:var(--bg-page)]">~</code> (text search)
            </div>
            <div>
              <span className="font-medium text-[color:var(--text-primary)]">Logic:</span>{' '}
              AND, OR
            </div>
            <div>
              <span className="font-medium text-[color:var(--text-primary)]">Order:</span>{' '}
              order by field ASC/DESC
            </div>
            <div className="pt-1">
              <span className="font-medium text-[color:var(--text-primary)]">Examples:</span>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-[10px]">
                <li><code className="px-1 rounded bg-[color:var(--bg-page)]">status = Done</code></li>
                <li><code className="px-1 rounded bg-[color:var(--bg-page)]">assignee = me</code></li>
                <li><code className="px-1 rounded bg-[color:var(--bg-page)]">project = S20</code></li>
                <li><code className="px-1 rounded bg-[color:var(--bg-page)]">status in (Todo, In Progress) AND assignee = me</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

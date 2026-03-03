import { Link } from 'react-router-dom';
import type { Issue } from '../../lib/api';
import { getIssueKey } from '../../lib/api';

interface TaskSubtasksProps {
  issueId: string;
  projectId: string | undefined;
  subtasks: Issue[];
  getStatusMeta: (name: string) => { color?: string; icon?: string } | undefined;
}

export default function TaskSubtasks({
  issueId,
  projectId,
  subtasks,
  getStatusMeta,
}: TaskSubtasksProps) {
  const addSubtaskUrl = projectId
    ? `/projects/${projectId}/issues?create=1&parent=${issueId}`
    : '#';

  return (
    <div className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">
          Subtasks
        </h3>
        {projectId && (
          <Link
            to={addSubtaskUrl}
            className="text-[11px] text-[color:var(--accent)] hover:underline font-medium"
          >
            Add subtask
          </Link>
        )}
      </div>
      {subtasks.length === 0 ? (
        <p className="text-xs text-[color:var(--text-muted)]">No subtasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {subtasks.map((st) => {
            const meta = getStatusMeta(st.status);
            return (
              <li
                key={st._id}
                className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-[color:var(--bg-page)]"
              >
                <Link
                  to={`/projects/${projectId}/issues/${encodeURIComponent(getIssueKey(st))}`}
                  className="font-mono text-xs font-medium text-[color:var(--accent)] hover:underline shrink-0"
                >
                  {getIssueKey(st)}
                </Link>
                <span className="flex-1 min-w-0 text-xs text-[color:var(--text-primary)] truncate">
                  {st.title}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: meta?.color ? `${meta.color}20` : undefined,
                    color: meta?.color ?? 'var(--text-muted)',
                  }}
                >
                  {st.status}
                </span>
                {st.assignee && (
                  <span className="text-[10px] text-[color:var(--text-muted)] shrink-0">
                    {st.assignee.name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

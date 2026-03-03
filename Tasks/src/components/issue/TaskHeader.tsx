import type { Issue } from '../../lib/api';
import { getIssueKey } from '../../lib/api';
import { MetaBadge } from '../MetaBadge';

interface TaskHeaderProps {
  issue: Issue;
  getTypeMeta?: (name: string) => { icon?: string; color?: string } | undefined;
  getPriorityMeta?: (name: string) => { icon?: string; color?: string } | undefined;
  getStatusMeta?: (name: string) => { icon?: string; color?: string } | undefined;
}

export default function TaskHeader({ issue, getTypeMeta, getPriorityMeta, getStatusMeta }: TaskHeaderProps) {
  const issueKey = getIssueKey(issue);

  return (
    <div className="mb-6">
      <span className="text-[13px] text-[color:var(--text-muted)] font-medium">{issueKey}</span>
      <h1 className="text-xl font-semibold text-[color:var(--text-primary)] mt-1 break-words">{issue.title}</h1>
      {(getTypeMeta || getPriorityMeta || getStatusMeta) && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {getTypeMeta && <MetaBadge label={issue.type} meta={getTypeMeta(issue.type)} />}
          {getPriorityMeta && <MetaBadge label={issue.priority} meta={getPriorityMeta(issue.priority)} />}
          {getStatusMeta && <MetaBadge label={issue.status} meta={getStatusMeta(issue.status)} />}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          + Add sub-work item
        </button>
        <span className="text-[color:var(--text-muted)]">·</span>
        <button
          type="button"
          className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          Add relation
        </button>
        <span className="text-[color:var(--text-muted)]">·</span>
        <button
          type="button"
          className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          Add link
        </button>
        <span className="text-[color:var(--text-muted)]">·</span>
        <button
          type="button"
          className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          Attach
        </button>
      </div>
    </div>
  );
}

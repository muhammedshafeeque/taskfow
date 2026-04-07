import { Link, useNavigate } from 'react-router-dom';

interface TaskBreadcrumbProps {
  projectId?: string;
  projectName: string;
  issueKey: string;
}

export default function TaskBreadcrumb({
  projectId,
  projectName,
  issueKey,
}: TaskBreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-3">
      {projectId ? (
        <Link
          to={`/projects/${projectId}/issues`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-xs font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)] hover:text-[color:var(--text-primary)] transition"
        >
          ← Back to issues
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-xs font-medium text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)] hover:text-[color:var(--text-primary)] transition"
        >
          ← Back
        </button>
      )}
      <nav className="flex items-center gap-0 mt-2 text-xs text-[color:var(--text-muted)]">
        <span className="text-[color:var(--text-primary)]/90 font-medium">{projectName}</span>
        <span className="mx-1.5 opacity-40">›</span>
        <span>Work items</span>
        <span className="mx-1.5 opacity-40">›</span>
        <span className="font-mono font-semibold text-[color:var(--text-primary)]">{issueKey}</span>
      </nav>
    </div>
  );
}

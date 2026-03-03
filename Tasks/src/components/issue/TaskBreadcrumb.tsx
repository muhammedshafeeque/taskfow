import { Link, useNavigate } from 'react-router-dom';

interface TaskBreadcrumbProps {
  projectId?: string;
  projectName: string;
  issueKey: string;
  onDelete: () => void;
}

export default function TaskBreadcrumb({
  projectId,
  projectName,
  issueKey,
  onDelete,
}: TaskBreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      {projectId ? (
        <Link
          to={`/projects/${projectId}/issues`}
          className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          ← Back to issues
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          ← Back
        </button>
      )}
      <div className="flex items-center justify-between gap-4 mt-1">
        <nav className="text-[11px] text-[color:var(--text-muted)]">
          {projectName} / Work Items / {issueKey}
        </nav>
        <button
          type="button"
          onClick={onDelete}
          className="text-[11px] text-[color:var(--text-muted)] hover:text-red-400 transition-colors"
        >
          Delete issue
        </button>
      </div>
    </div>
  );
}

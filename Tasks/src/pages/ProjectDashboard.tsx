import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { issuesApi, boardsApi, sprintsApi, projectsApi } from '../lib/api';

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [counts, setCounts] = useState<{ issues: number; boards: number; sprints: number }>({
    issues: 0,
    boards: 0,
    sprints: 0,
  });
  const [canManageSettings, setCanManageSettings] = useState(false);

  useEffect(() => {
    if (!token || !projectId) return;
    Promise.all([
      issuesApi.list({ page: 1, limit: 1, token, project: projectId }).then((r) =>
        r.success && r.data ? r.data.total : 0
      ),
      boardsApi.list(1, 1, projectId, token).then((r) =>
        r.success && r.data ? r.data.total : 0
      ),
      sprintsApi.list(1, 1, projectId, undefined, token).then((r) =>
        r.success && r.data ? r.data.total : 0
      ),
    ]).then(([issues, boards, sprints]) => setCounts({ issues, boards, sprints }));
  }, [token, projectId]);

  useEffect(() => {
    if (!token || !projectId) return;
    projectsApi.getMyPermissions(projectId, token).then((res) => {
      if (res.success && res.data && 'permissions' in res.data) {
        const perms = (res.data as { permissions: string[] }).permissions ?? [];
        setCanManageSettings(perms.includes('settings:manage'));
      }
    });
  }, [token, projectId]);

  if (!projectId) return null;

  const base = `/projects/${projectId}`;
  return (
    <div className="p-8 animate-fade-in">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold mb-1">Project dashboard</h1>
        <p className="text-[13px] text-[color:var(--text-muted)] mb-6">
          Overview and quick links for this project.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to={`${base}/issues`}
            className="block p-5 rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)] transition animate-slide-in-right"
          >
            <h2 className="text-sm font-semibold">Issues</h2>
            <p className="text-[13px] text-[color:var(--text-muted)] mt-1">
              {counts.issues} issue(s)
            </p>
          </Link>
          <Link
            to={`${base}/boards`}
            className="block p-5 rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)] transition animate-slide-in-right animation-delay-100"
          >
            <h2 className="text-sm font-semibold">Boards</h2>
            <p className="text-[13px] text-[color:var(--text-muted)] mt-1">
              {counts.boards} board(s)
            </p>
          </Link>
          <Link
            to={`${base}/sprints`}
            className="block p-5 rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)] transition animate-slide-in-right animation-delay-200"
          >
            <h2 className="text-sm font-semibold">Sprints</h2>
            <p className="text-[13px] text-[color:var(--text-muted)] mt-1">
              {counts.sprints} sprint(s)
            </p>
          </Link>
          {canManageSettings && (
            <Link
              to={`${base}/settings`}
              className="block p-5 rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)] transition animate-slide-in-right animation-delay-300"
            >
              <h2 className="text-sm font-semibold">Settings</h2>
              <p className="text-[13px] text-[color:var(--text-muted)] mt-1">
                Project name, key, lead
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '../contexts/AuthContext';
import { projectsApi, dashboardApi, type Project } from '../lib/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<{ data: Project[]; total: number }>({ data: [], total: 0 });
  const [stats, setStats] = useState<{
    totalIssues: number;
    issuesByStatus: Record<string, number>;
    recentIssues: Array<{
      _id: string;
      key?: string;
      title: string;
      status: string;
      project: string;
      projectName?: string;
      updatedAt: string;
    }>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    projectsApi.list(1, 100, token).then((res) => {
      if (res.success && res.data)
        setProjects({ data: res.data.data, total: res.data.total });
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setStatsLoading(true);
    dashboardApi.getStats(token).then((res) => {
      setStatsLoading(false);
      if (res.success && res.data) setStats(res.data);
    });
  }, [token]);

  const chartData = stats
    ? Object.entries(stats.issuesByStatus).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div className="p-8 animate-fade-in">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
        <p className="text-[13px] text-[color:var(--text-muted)] mb-6">
          Select a project to view its dashboard, issues, boards, and sprints.
        </p>

        <div className="mb-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)] transition"
          >
            <span>All projects</span>
          </Link>
        </div>

        {statsLoading ? (
          <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-6 mb-8 text-center text-[color:var(--text-muted)] animate-pulse">
            Loading analytics…
          </div>
        ) : stats && (stats.totalIssues > 0 || chartData.length > 0) ? (
          <div className="mb-8 space-y-6">
            <h2 className="text-sm font-semibold">Cross-project overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
                <p className="text-[12px] text-[color:var(--text-muted)] uppercase tracking-wider">Total issues</p>
                <p className="text-2xl font-semibold text-[color:var(--text-primary)] mt-1">{stats.totalIssues}</p>
              </div>
              {chartData.slice(0, 3).map(({ status, count }) => (
                <div
                  key={status}
                  className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5"
                >
                  <p className="text-[12px] text-[color:var(--text-muted)] uppercase tracking-wider truncate">{status}</p>
                  <p className="text-2xl font-semibold text-[color:var(--text-primary)] mt-1">{count}</p>
                </div>
              ))}
            </div>
            {chartData.length > 0 && (
              <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)] mb-4">Issues by status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {stats.recentIssues.length > 0 && (
              <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)] mb-3">Recent activity</h3>
                <ul className="space-y-2">
                  {stats.recentIssues.map((issue) => (
                    <li key={issue._id}>
                      <Link
                        to={`/projects/${issue.project}/issues/${encodeURIComponent(issue.key ?? issue._id)}`}
                        className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-[color:var(--bg-page)] transition text-sm"
                      >
                        <span className="truncate text-[color:var(--text-primary)]">
                          {issue.key && <span className="text-[color:var(--text-muted)] mr-1">{issue.key}</span>}
                          {issue.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-[color:var(--text-muted)]">
                          {issue.projectName ?? issue.project} · {issue.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <h2 className="text-sm font-semibold mb-3">Your projects</h2>
        {projects.data.length === 0 ? (
          <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-6 text-center text-[color:var(--text-muted)]">
            No projects yet. Create one from the Projects page.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}/dashboard`}
                className="block p-5 rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-elevated)] transition animate-fade-in"
              >
                <h3 className="font-semibold text-sm">{p.name}</h3>
                <p className="text-[12px] text-[color:var(--text-muted)] mt-0.5">{p.key}</p>
                <p className="text-[12px] text-[color:var(--text-muted)] mt-2">Open project →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

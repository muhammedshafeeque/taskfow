import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, projectsApi, type Project } from '../lib/api';

interface CostEntry {
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  totalMinutes: number;
  totalHours: number;
}

function exportToCsv(entries: CostEntry[]): void {
  const headers = ['Project', 'User', 'Total Minutes', 'Total Hours'];
  const rows = entries.map((e) => [e.projectName, e.userName, e.totalMinutes, e.totalHours]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cost-usage-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CostUsage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState('');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!token) return;
    projectsApi.list(1, 100, token).then((res) => {
      if (res.success && res.data) {
        const d = res.data as { data?: Project[] };
        setProjects(d.data ?? []);
      }
    });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    dashboardApi
      .getCostUsage(token, projectId || undefined, from, to)
      .then((res) => {
        setLoading(false);
        if (res.success && res.data) setEntries(res.data.entries ?? []);
        else setError(res.message ?? 'Failed to load');
      })
      .catch(() => {
        setLoading(false);
        setError('Failed to load');
      });
  }, [token, projectId, from, to]);

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">Cost / Usage Report</h1>
      <p className="text-sm text-[color:var(--text-muted)]">
        Work log totals by project and user. Export to CSV for further analysis.
      </p>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-[color:var(--text-muted)] mb-1">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm min-w-[180px]"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[color:var(--text-muted)] mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-[color:var(--text-muted)] mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => exportToCsv(entries)}
            disabled={entries.length === 0}
            className="btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-8 text-center text-[color:var(--text-muted)] animate-pulse">
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-red-400">{error}</div>
      ) : (
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-page)]/50">
                <th className="text-left px-6 py-4 font-medium text-[color:var(--text-muted)]">Project</th>
                <th className="text-left px-6 py-4 font-medium text-[color:var(--text-muted)]">User</th>
                <th className="text-right px-6 py-4 font-medium text-[color:var(--text-muted)]">Minutes</th>
                <th className="text-right px-6 py-4 font-medium text-[color:var(--text-muted)]">Hours</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[color:var(--text-muted)]">
                    No work log data for this period.
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr
                    key={`${e.projectId}-${e.userId}-${i}`}
                    className="border-b border-[color:var(--border-subtle)]/60 last:border-b-0 hover:bg-[color:var(--bg-page)]/30"
                  >
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{e.projectName}</td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{e.userName}</td>
                    <td className="px-6 py-4 text-right text-[color:var(--text-muted)]">{e.totalMinutes}</td>
                    <td className="px-6 py-4 text-right text-[color:var(--text-muted)]">{e.totalHours.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

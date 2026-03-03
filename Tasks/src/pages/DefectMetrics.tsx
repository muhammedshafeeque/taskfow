import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, projectsApi, type Project } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DefectMetricsData {
  totalBugs: number;
  openBugs: number;
  closedBugs: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  defectDensity?: number;
}

export default function DefectMetrics() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<DefectMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? '');

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
    if (projectId && token) {
      projectsApi.get(projectId, token).then((res) => {
        if (res.success && res.data) setProject(res.data);
      });
    } else {
      setProject(null);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    dashboardApi
      .getDefectMetrics(token, selectedProjectId || undefined)
      .then((res) => {
        setLoading(false);
        if (res.success && res.data) setData(res.data);
        else setError(res.message ?? 'Failed to load');
      })
      .catch(() => {
        setLoading(false);
        setError('Failed to load');
      });
  }, [token, selectedProjectId]);

  useEffect(() => {
    if (projectId && !selectedProjectId) setSelectedProjectId(projectId);
  }, [projectId, selectedProjectId]);

  const statusData = data?.byStatus ? Object.entries(data.byStatus).map(([status, count]) => ({ status, count })) : [];
  const priorityData = data?.byPriority ? Object.entries(data.byPriority).map(([priority, count]) => ({ priority, count })) : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="mb-4 flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
            Defect metrics {project ? `· ${project.name}` : ''}
          </h1>
          <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
            Bugs by status, priority, and defect density.
          </p>
        </div>
        {!projectId && projects.length > 0 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm min-w-[180px]"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-8 text-center text-[color:var(--text-muted)] animate-pulse">
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-red-400">{error}</div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
              <p className="text-[12px] text-[color:var(--text-muted)] uppercase tracking-wider">Total bugs</p>
              <p className="text-2xl font-semibold text-[color:var(--text-primary)] mt-1">{data.totalBugs}</p>
            </div>
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
              <p className="text-[12px] text-[color:var(--text-muted)] uppercase tracking-wider">Open</p>
              <p className="text-2xl font-semibold text-[color:var(--text-primary)] mt-1">{data.openBugs}</p>
            </div>
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
              <p className="text-[12px] text-[color:var(--text-muted)] uppercase tracking-wider">Closed</p>
              <p className="text-2xl font-semibold text-[color:var(--text-primary)] mt-1">{data.closedBugs}</p>
            </div>
            {data.defectDensity != null && (
              <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
                <p className="text-[12px] text-[color:var(--text-muted)] uppercase tracking-wider">Defect density</p>
                <p className="text-2xl font-semibold text-[color:var(--text-primary)] mt-1">{data.defectDensity}</p>
                <p className="text-xs text-[color:var(--text-muted)]">bugs per story point</p>
              </div>
            )}
          </div>

          {statusData.length > 0 && (
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
              <h3 className="text-sm font-semibold text-[color:var(--text-primary)] mb-4">Bugs by status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                    />
                    <Bar dataKey="count" name="Count" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {priorityData.length > 0 && (
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-5">
              <h3 className="text-sm font-semibold text-[color:var(--text-primary)] mb-4">Bugs by priority</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                    />
                    <Bar dataKey="count" name="Count" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {data.totalBugs === 0 && (
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-8 text-center text-[color:var(--text-muted)]">
              No bugs found for this scope.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { traceabilityApi, projectsApi, type TraceabilityRow, type Project } from '../lib/api';

export default function Traceability() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [rows, setRows] = useState<TraceabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !projectId) return;
    projectsApi.get(projectId, token).then((res) => {
      if (res.success && res.data) setProject(res.data);
    });
  }, [token, projectId]);

  useEffect(() => {
    if (!token || !projectId) return;
    setLoading(true);
    setError('');
    traceabilityApi.get(projectId, token).then((res) => {
      setLoading(false);
      if (res.success && res.data) setRows(res.data);
      else setError(res.message ?? 'Failed to load');
    });
  }, [token, projectId]);

  if (!projectId) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="mb-4 flex shrink-0">
        <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Traceability {project ? `· ${project.name}` : ''}
        </h1>
        <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
          Requirements (issues) linked to test cases.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-8 text-center text-[color:var(--text-muted)] animate-pulse">
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-red-400">{error}</div>
      ) : (
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-page)]/50">
                <th className="text-left px-6 py-4 font-medium text-[color:var(--text-muted)] w-48">Requirement</th>
                <th className="text-left px-6 py-4 font-medium text-[color:var(--text-muted)]">Linked test cases</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-[color:var(--text-muted)]">
                    No requirements with linked test cases. Link test cases to issues in Test cases.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.issueId}
                    className="border-b border-[color:var(--border-subtle)]/60 last:border-b-0 hover:bg-[color:var(--bg-page)]/30"
                  >
                    <td className="px-6 py-4 align-top">
                      <Link
                        to={`/projects/${projectId}/issues/${encodeURIComponent(row.issueKey)}`}
                        className="text-[color:var(--accent)] hover:underline font-medium"
                      >
                        {row.issueKey}
                      </Link>
                      <p className="text-[color:var(--text-primary)] text-xs mt-0.5 line-clamp-2">{row.issueTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      {row.linkedTestCases.length === 0 ? (
                        <span className="text-[color:var(--text-muted)] italic">Not linked</span>
                      ) : (
                        <ul className="space-y-1">
                          {row.linkedTestCases.map((tc) => (
                            <li key={tc.testCaseId} className="flex items-center gap-2">
                              <Link
                                to={`/projects/${projectId}/test-cases`}
                                className="text-[color:var(--accent)] hover:underline"
                              >
                                {tc.title}
                              </Link>
                              <span className="text-xs text-[color:var(--text-muted)]">({tc.status})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
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

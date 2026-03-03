import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testCasesApi, projectsApi, type TestCase, type Project } from '../lib/api';

export default function TestCasesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !projectId) return;
    projectsApi.get(projectId, token).then((res) => {
      if (res.success && res.data) setProject(res.data);
    });
  }, [token, projectId]);

  useEffect(() => {
    if (!token || !projectId) return;
    setLoading(true);
    testCasesApi.list(projectId, token).then((res) => {
      setLoading(false);
      if (res.success && res.data) setTestCases(Array.isArray(res.data) ? res.data : []);
    });
  }, [token, projectId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !projectId || !newTitle.trim()) return;
    setSaving(true);
    const res = await testCasesApi.create(projectId, { title: newTitle.trim() }, token);
    setSaving(false);
    if (res.success && res.data) {
      setTestCases((prev) => [res.data!, ...prev]);
      setNewTitle('');
    }
  }

  async function handleDelete(tc: TestCase) {
    if (!token || !projectId || !confirm(`Delete test case "${tc.title}"?`)) return;
    const res = await testCasesApi.delete(projectId, tc._id, token);
    if (res.success) setTestCases((prev) => prev.filter((x) => x._id !== tc._id));
  }

  if (!projectId) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Test cases {project ? `· ${project.name}` : ''}
        </h1>
      </div>

      <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] overflow-hidden">
        <div className="p-6 border-b border-[color:var(--border-subtle)]">
          <h2 className="text-sm font-semibold text-[color:var(--text-primary)]">Test cases</h2>
          <p className="text-[color:var(--text-muted)] text-xs mt-0.5">
            Manage test cases and link them to issues for traceability.
          </p>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-[color:var(--text-muted)] mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Test case title"
                className="px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm w-64"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !newTitle.trim()}
              className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs font-medium disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add test case'}
            </button>
          </form>

          {loading ? (
            <div className="text-[color:var(--text-muted)] animate-pulse">Loading…</div>
          ) : testCases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--border-subtle)] p-8 text-center text-[color:var(--text-muted)] text-xs">
              No test cases yet. Add one above.
            </div>
          ) : (
            <ul className="rounded-xl border border-[color:var(--border-subtle)] overflow-hidden divide-y divide-[color:var(--border-subtle)]/70">
              {testCases.map((tc) => (
                <li key={tc._id} className="flex items-center justify-between px-4 py-3 bg-[color:var(--bg-surface)] hover:bg-[color:var(--bg-elevated)] group">
                  <div className="min-w-0">
                    <span className="font-medium text-[color:var(--text-primary)] text-sm">{tc.title}</span>
                    {tc.linkedIssueId && (
                      <Link
                        to={`/projects/${projectId}/issues/${encodeURIComponent(tc.linkedIssueId.key)}`}
                        className="ml-2 text-xs text-[color:var(--accent)] hover:underline"
                      >
                        {tc.linkedIssueId.key}
                      </Link>
                    )}
                  </div>
                  <span className="text-[color:var(--text-muted)] text-xs shrink-0">{tc.status}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tc)}
                    className="p-1 rounded text-[color:var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

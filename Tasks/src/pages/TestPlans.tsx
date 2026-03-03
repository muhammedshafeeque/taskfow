import { useEffect, useState } from 'react';
import { FiTrash2, FiPlus, FiPlay } from 'react-icons/fi';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  testPlansApi,
  testCasesApi,
  projectsApi,
  type TestPlan,
  type TestCycle,
  type TestCase,
  type Project,
} from '../lib/api';

export default function TestPlansPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [cyclesByPlan, setCyclesByPlan] = useState<Record<string, TestCycle[]>>({});
  const [showNewCycle, setShowNewCycle] = useState<string | null>(null);
  const [newCycleName, setNewCycleName] = useState('');

  useEffect(() => {
    if (!token || !projectId) return;
    projectsApi.get(projectId, token).then((res) => {
      if (res.success && res.data) setProject(res.data);
    });
  }, [token, projectId]);

  useEffect(() => {
    if (!token || !projectId) return;
    setLoading(true);
    Promise.all([
      testPlansApi.list(projectId, token),
      testCasesApi.list(projectId, token),
    ]).then(([plansRes, casesRes]) => {
      setLoading(false);
      if (plansRes.success && plansRes.data) setTestPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      if (casesRes.success && casesRes.data) setTestCases(Array.isArray(casesRes.data) ? casesRes.data : []);
    });
  }, [token, projectId]);

  async function loadCycles(planId: string) {
    if (!token || !projectId) return;
    const res = await testPlansApi.listCycles(projectId, planId, token);
    if (res.success && res.data) {
      setCyclesByPlan((prev) => ({ ...prev, [planId]: Array.isArray(res.data) ? res.data : [] }));
    }
  }

  useEffect(() => {
    if (expandedPlanId && token && projectId) {
      loadCycles(expandedPlanId);
    }
  }, [expandedPlanId, token, projectId]);

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !projectId || !newName.trim()) return;
    setSaving(true);
    const res = await testPlansApi.create(
      projectId,
      { name: newName.trim(), description: newDesc.trim() || undefined, testCaseIds: Array.from(selectedCaseIds) },
      token
    );
    setSaving(false);
    if (res.success && res.data) {
      setTestPlans((prev) => [res.data!, ...prev]);
      setNewName('');
      setNewDesc('');
      setSelectedCaseIds(new Set());
      setShowCreate(false);
    }
  }

  async function handleDeletePlan(plan: TestPlan) {
    if (!token || !projectId || !confirm(`Delete test plan "${plan.name}"?`)) return;
    const res = await testPlansApi.delete(projectId, plan._id, token);
    if (res.success) {
      setTestPlans((prev) => prev.filter((p) => p._id !== plan._id));
      setCyclesByPlan((prev) => {
        const next = { ...prev };
        delete next[plan._id];
        return next;
      });
    }
  }

  function toggleCase(caseId: string) {
    setSelectedCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId);
      else next.add(caseId);
      return next;
    });
  }

  async function handleCreateCycle(planId: string) {
    if (!token || !projectId || !newCycleName.trim()) return;
    setSaving(true);
    const res = await testPlansApi.createCycle(
      projectId,
      planId,
      { name: newCycleName.trim(), status: 'draft' },
      token
    );
    setSaving(false);
    if (res.success && res.data) {
      setCyclesByPlan((prev) => ({
        ...prev,
        [planId]: [res.data!, ...(prev[planId] ?? [])],
      }));
      setNewCycleName('');
      setShowNewCycle(null);
    }
  }

  if (!projectId) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Test plans {project ? `· ${project.name}` : ''}
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] text-sm font-medium hover:bg-[color:var(--bg-elevated)]"
        >
          <FiPlus className="w-4 h-4" /> New plan
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] p-6">
          <h2 className="text-sm font-semibold text-[color:var(--text-primary)] mb-4">Create test plan</h2>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label className="block text-xs text-[color:var(--text-muted)] mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Plan name"
                className="px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm w-full max-w-md"
              />
            </div>
            <div>
              <label className="block text-xs text-[color:var(--text-muted)] mb-1">Description (optional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description"
                rows={2}
                className="px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm w-full max-w-md"
              />
            </div>
            <div>
              <label className="block text-xs text-[color:var(--text-muted)] mb-2">Select test cases</label>
              <div className="max-h-48 overflow-y-auto rounded-md border border-[color:var(--border-subtle)] p-2 space-y-1">
                {testCases.length === 0 ? (
                  <p className="text-xs text-[color:var(--text-muted)]">No test cases. Create some in Test cases first.</p>
                ) : (
                  testCases.map((tc) => (
                    <label key={tc._id} className="flex items-center gap-2 cursor-pointer hover:bg-[color:var(--bg-elevated)] rounded px-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedCaseIds.has(tc._id)}
                        onChange={() => toggleCase(tc._id)}
                        className="rounded"
                      />
                      <span className="text-sm">{tc.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !newName.trim()}
                className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--accent)] text-white text-xs font-medium disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setNewName('');
                  setNewDesc('');
                  setSelectedCaseIds(new Set());
                }}
                className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] overflow-hidden">
        <div className="p-6 border-b border-[color:var(--border-subtle)]">
          <h2 className="text-sm font-semibold text-[color:var(--text-primary)]">Test plans</h2>
          <p className="text-[color:var(--text-muted)] text-xs mt-0.5">
            Create plans from test cases, then add cycles to run them.
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-[color:var(--text-muted)] animate-pulse">Loading…</div>
          ) : testPlans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--border-subtle)] p-8 text-center text-[color:var(--text-muted)] text-xs">
              No test plans yet. Create one above.
            </div>
          ) : (
            <ul className="space-y-4">
              {testPlans.map((plan) => (
                <li key={plan._id} className="rounded-xl border border-[color:var(--border-subtle)] overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-[color:var(--bg-surface)] hover:bg-[color:var(--bg-elevated)] cursor-pointer"
                    onClick={() => setExpandedPlanId(expandedPlanId === plan._id ? null : plan._id)}
                  >
                    <div>
                      <span className="font-medium text-[color:var(--text-primary)] text-sm">{plan.name}</span>
                      {plan.description && (
                        <span className="ml-2 text-xs text-[color:var(--text-muted)]">{plan.description}</span>
                      )}
                      <span className="ml-2 text-xs text-[color:var(--text-muted)]">
                        ({plan.testCaseIds?.length ?? 0} cases)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan);
                        }}
                        className="p-1 rounded text-[color:var(--text-muted)] hover:text-red-500"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {expandedPlanId === plan._id && (
                    <div className="border-t border-[color:var(--border-subtle)] p-4 bg-[color:var(--bg-page)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-[color:var(--text-muted)]">Cycles</span>
                        {showNewCycle === plan._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newCycleName}
                              onChange={(e) => setNewCycleName(e.target.value)}
                              placeholder="Cycle name"
                              className="px-2 py-1 rounded text-xs w-40 border border-[color:var(--border-subtle)]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleCreateCycle(plan._id)}
                              disabled={saving || !newCycleName.trim()}
                              className="px-2 py-1 rounded text-xs bg-[color:var(--accent)] text-white disabled:opacity-50"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewCycle(null);
                                setNewCycleName('');
                              }}
                              className="px-2 py-1 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowNewCycle(plan._id)}
                            className="text-xs text-[color:var(--accent)] hover:underline"
                          >
                            + Add cycle
                          </button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {(cyclesByPlan[plan._id] ?? []).map((cycle) => (
                          <li
                            key={cycle._id}
                            className="flex items-center justify-between px-3 py-2 rounded-md bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)]"
                          >
                            <span className="text-sm">{cycle.name}</span>
                            <span className="text-xs text-[color:var(--text-muted)]">{cycle.status}</span>
                            <Link
                              to={`/projects/${projectId}/test-plans/${plan._id}/cycles/${cycle._id}/run`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-[color:var(--accent)] text-white hover:opacity-90"
                            >
                              <FiPlay className="w-3 h-3" /> Run
                            </Link>
                          </li>
                        ))}
                        {(cyclesByPlan[plan._id] ?? []).length === 0 && showNewCycle !== plan._id && (
                          <li className="text-xs text-[color:var(--text-muted)] py-2">No cycles yet.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { designationsApi, type Designation } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';
import { EditIcon, TrashIcon } from '../components/icons/NavigationIcons';

export default function Designations() {
  const { token } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  function load() {
    if (!token) return;
    designationsApi.list(token).then((res) => {
      if (res.success && res.data) setDesignations(Array.isArray(res.data) ? res.data : []);
    });
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    designationsApi.list(token).then((res) => {
      setLoading(false);
      if (res.success && res.data) setDesignations(Array.isArray(res.data) ? res.data : []);
    });
  }, [token]);

  const filteredDesignations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return designations;
    return designations.filter((d) => d.name.toLowerCase().includes(q));
  }, [designations, search]);

  function openCreate() {
    setForm({ name: '' });
    setEditId(null);
    setError('');
    setModal('create');
  }

  function openEdit(d: Designation) {
    setForm({ name: d.name });
    setEditId(d._id);
    setError('');
    setModal('edit');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      if (modal === 'create') {
        const res = await designationsApi.create({ name: form.name.trim() }, token);
        if (res.success) {
          setModal(null);
          load();
        } else setError((res as { message?: string }).message ?? 'Failed to create');
      } else if (editId) {
        const res = await designationsApi.update(editId, { name: form.name.trim() }, token);
        if (res.success) {
          setModal(null);
          load();
        } else setError((res as { message?: string }).message ?? 'Failed to update');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteId) return;
    const res = await designationsApi.delete(deleteId, token);
    setDeleteId(null);
    if (res.success) load();
  }

  if (loading) {
    return (
      <div className="w-full p-6 lg:p-8">
        <p className="text-sm text-[color:var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">Designations</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            Manage designations (e.g. job titles). Assign one to each user when inviting.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary shrink-0 px-4 py-2 rounded-lg text-sm"
        >
          Add designation
        </button>
      </div>

      <input
        type="search"
        placeholder="Search designations…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40"
      />

      <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: '85%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-page)]/50">
              <th className="text-left px-6 py-4 text-sm font-medium text-[color:var(--text-muted)]">Name</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[color:var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDesignations.map((d) => (
              <tr
                key={d._id}
                className="border-b border-[color:var(--border-subtle)]/60 last:border-b-0 hover:bg-[color:var(--bg-page)]/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-[color:var(--text-primary)]">{d.name}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(d)}
                      title="Edit"
                      className="p-1.5 rounded-md text-[color:var(--text-muted)] hover:text-[color:var(--accent)] hover:bg-[color:var(--bg-page)] transition"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(d._id)}
                      title="Delete"
                      className="p-1.5 rounded-md text-[color:var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDesignations.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[color:var(--text-muted)]">
              {designations.length === 0
                ? 'No designations yet. Create one to get started.'
                : 'No designations match your search.'}
            </p>
            {designations.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary mt-4 px-4 py-2 rounded-lg text-sm"
              >
                Add designation
              </button>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-2xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)] mb-6">
                {modal === 'create' ? 'Create designation' : 'Edit designation'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-primary)] mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40"
                    placeholder="e.g. Developer"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : modal === 'create' ? 'Create' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 py-2 rounded-lg border border-[color:var(--border-subtle)] text-sm text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete designation"
        message="Are you sure? Users with this designation will keep it until their profile is updated."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

import { Fragment, useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rolesApi, permissionsApi, type Role, type PermissionItem } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';
import { EditIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '../components/icons/NavigationIcons';

export default function Roles() {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState({ name: '', permissions: [] as string[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const permMap = useMemo(() => new Map(permissions.map((p) => [p.code, p.label])), [permissions]);
  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, search]);

  function loadRoles() {
    if (!token) return;
    rolesApi.list(token).then((res) => {
      if (res.success && res.data) setRoles(Array.isArray(res.data) ? res.data : []);
    });
  }

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      rolesApi.list(token),
      permissionsApi.list(token),
    ]).then(([rolesRes, permRes]) => {
      setLoading(false);
      if (rolesRes.success && rolesRes.data) setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      if (permRes.success && permRes.data) setPermissions(Array.isArray(permRes.data) ? permRes.data : []);
    });
  }, [token]);

  function openCreate() {
    setForm({ name: '', permissions: [] });
    setEditId(null);
    setError('');
    setModal('create');
  }

  function openEdit(role: Role) {
    setForm({ name: role.name, permissions: role.permissions ?? [] });
    setEditId(role._id);
    setError('');
    setModal('edit');
  }

  function togglePermission(code: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter((p) => p !== code)
        : [...prev.permissions, code],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      if (modal === 'create') {
        const res = await rolesApi.create({ name: form.name.trim(), permissions: form.permissions }, token);
        if (res.success) {
          setModal(null);
          loadRoles();
        } else setError((res as { message?: string }).message ?? 'Failed to create role');
      } else if (editId) {
        const res = await rolesApi.update(editId, { name: form.name.trim(), permissions: form.permissions }, token);
        if (res.success) {
          setModal(null);
          loadRoles();
        } else setError((res as { message?: string }).message ?? 'Failed to update role');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteId) return;
    const res = await rolesApi.delete(deleteId, token);
    setDeleteId(null);
    if (res.success) loadRoles();
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
          <h1 className="text-2xl font-semibold text-[color:var(--text-primary)]">Roles</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            Create and edit roles. Assign permissions from the predefined list. No new permissions can be created in the UI.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary shrink-0 px-4 py-2 rounded-lg text-sm"
        >
          Add role
        </button>
      </div>

      <input
        type="search"
        placeholder="Search roles…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40"
      />

      <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: '4%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '52%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-page)]/50">
              <th className="w-10 px-6 py-4" />
              <th className="text-left px-6 py-4 text-sm font-medium text-[color:var(--text-muted)]">Name</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[color:var(--text-muted)]">Permissions</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[color:var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => {
              const perms = role.permissions ?? [];
              const isExpanded = expandedId === role._id;
              return (
                <Fragment key={role._id}>
                  <tr
                    key={role._id}
                    className="border-b border-[color:var(--border-subtle)]/60 last:border-b-0 hover:bg-[color:var(--bg-page)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {perms.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : role._id)}
                          className="p-1 rounded-lg text-[color:var(--text-muted)] hover:text-[color:var(--accent)] hover:bg-[color:var(--bg-page)] transition-colors"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-6 block" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[color:var(--text-primary)]">{role.name}</span>
                    </td>
                    <td className="px-6 py-4 text-[color:var(--text-muted)]">
                      {perms.length} permission{perms.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(role)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-[color:var(--text-muted)] hover:text-[color:var(--accent)] hover:bg-[color:var(--bg-page)] transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(role._id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-[color:var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && perms.length > 0 && (
                    <tr className="border-b border-[color:var(--border-subtle)]/60 last:border-b-0 bg-[color:var(--bg-page)]/20">
                      <td className="px-6 py-0" />
                      <td colSpan={3} className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {perms.map((code) => (
                            <span
                              key={code}
                              className="inline-flex px-2 py-1 rounded-md bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-primary)]"
                            >
                              {permMap.get(code) ?? code}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filteredRoles.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[color:var(--text-muted)]">
              {roles.length === 0
                ? 'No roles yet. Create one to get started.'
                : 'No roles match your search.'}
            </p>
            {roles.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="btn-primary mt-4 px-4 py-2 rounded-lg text-sm"
              >
                Add role
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
            className="bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)] mb-2">
                {modal === 'create' ? 'Create role' : 'Edit role'}
              </h2>
              <p className="text-sm text-[color:var(--text-muted)] mb-6">
                Assign permissions from the predefined list.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-primary)] mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40"
                    placeholder="e.g. Admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-primary)] mb-2">Permissions</label>
                  <div className="max-h-64 overflow-y-auto space-y-2 p-3 rounded-lg bg-[color:var(--bg-page)]/60 border border-[color:var(--border-subtle)]">
                    {permissions.map((p) => (
                      <label key={p.code} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(p.code)}
                          onChange={() => togglePermission(p.code)}
                          className="h-4 w-4 rounded border-[color:var(--border-subtle)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]/40"
                        />
                        <span className="text-sm text-[color:var(--text-primary)]">
                          {p.label} <span className="text-[color:var(--text-muted)]">({p.code})</span>
                        </span>
                      </label>
                    ))}
                  </div>
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
        title="Delete role"
        message="Are you sure? Users with this role will lose these permissions."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

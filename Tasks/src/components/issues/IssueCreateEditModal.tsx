import { createPortal } from 'react-dom';
import { DescriptionEditor } from '../issue';
import type { Issue, Project, User, Milestone } from '../../lib/api';

export interface IssueForm {
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  project: string;
  assignee: string;
  parent: string;
  milestone: string;
  customFieldValues: Record<string, unknown>;
  fixVersion: string;
  affectsVersions: string[];
}

interface IssueCreateEditModalProps {
  modal: 'create' | 'edit' | null;
  setModal: (m: 'create' | 'edit' | null) => void;
  form: IssueForm;
  setForm: (f: IssueForm | ((prev: IssueForm) => IssueForm)) => void;
  submitError: string;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  typeList: string[];
  priorityList: string[];
  statusList: string[];
  users: User[];
  parentCandidates: Issue[];
  project: Project | null;
  getIssueKey: (issue: Issue) => string;
  projects?: Project[];
  showProjectSelector?: boolean;
  milestones?: Milestone[];
}

export function IssueCreateEditModal(props: IssueCreateEditModalProps) {
  const { modal, setModal, form, setForm, submitError, submitting, handleSubmit, typeList, priorityList, statusList, users, parentCandidates, project, getIssueKey, projects = [], showProjectSelector, milestones = [] } = props;
  if (!modal) return null;

  const inputCls = 'w-full px-3 py-1.5 rounded-md bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={() => setModal(null)}>
      <div className="w-full max-w-lg bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-[color:var(--text-primary)] mb-3">{modal === 'create' ? 'New issue' : 'Edit issue'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {submitError && <p className="text-xs text-red-400">{submitError}</p>}
          {showProjectSelector && projects.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Project</label>
              <select
                value={form.project}
                onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
                required
                disabled={modal === 'edit'}
                className={inputCls}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.key})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Description</label>
            <DescriptionEditor value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Add a description…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                {typeList.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputCls}>
                {priorityList.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Assignee</label>
              <select value={form.assignee} onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))} className={inputCls}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            {(typeList.includes('Epic') || typeList.includes('Story')) && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Parent (Epic/Story)</label>
                <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className={inputCls}>
                  <option value="">None</option>
                  {parentCandidates.map((p) => <option key={p._id} value={p._id}>{getIssueKey(p)} · {p.title}</option>)}
                </select>
              </div>
            )}
            {milestones.length > 0 && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Milestone</label>
                <select value={form.milestone} onChange={(e) => setForm((f) => ({ ...f, milestone: e.target.value }))} className={inputCls}>
                  <option value="">None</option>
                  {milestones.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}{m.dueDate ? ` (${new Date(m.dueDate).toLocaleDateString()})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {project?.versions && project.versions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Fix version</label>
                <select value={form.fixVersion} onChange={(e) => setForm((f) => ({ ...f, fixVersion: e.target.value }))} className={inputCls}>
                  <option value="">None</option>
                  {project.versions.map((v) => <option key={v.id} value={v.id}>{v.name} {v.status !== 'unreleased' ? `(${v.status})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">Affects versions</label>
                <select multiple value={form.affectsVersions} onChange={(e) => setForm((f) => ({ ...f, affectsVersions: Array.from(e.target.selectedOptions, (o) => o.value) }))} className={inputCls + ' min-h-[80px]'}>
                  {project.versions.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <p className="text-[color:var(--text-muted)] text-[11px] mt-1">Hold Ctrl/Cmd to select multiple.</p>
              </div>
            </div>
          )}
          {project?.customFields?.length ? (
            <div className="space-y-3 pt-2 border-t border-[color:var(--border-subtle)]">
              <p className="text-xs text-[color:var(--text-muted)]">Custom fields</p>
              {project.customFields.map((field) => {
                const val = form.customFieldValues[field.key];
                const value = val === undefined || val === null ? '' : String(val);
                return (
                  <div key={field.id}>
                    <label className="block text-xs font-medium text-[color:var(--text-primary)] mb-1">{field.label}{field.required ? ' *' : ''}</label>
                    {field.fieldType === 'text' && <input type="text" value={value} onChange={(e) => setForm((f) => ({ ...f, customFieldValues: { ...f.customFieldValues, [field.key]: e.target.value || undefined } }))} required={field.required} className={inputCls} />}
                    {field.fieldType === 'number' && <input type="number" value={value} onChange={(e) => setForm((f) => ({ ...f, customFieldValues: { ...f.customFieldValues, [field.key]: e.target.value === '' ? undefined : Number(e.target.value) } }))} required={field.required} className={inputCls} />}
                    {field.fieldType === 'date' && <input type="date" value={value} onChange={(e) => setForm((f) => ({ ...f, customFieldValues: { ...f.customFieldValues, [field.key]: e.target.value || undefined } }))} required={field.required} className={inputCls} />}
                    {field.fieldType === 'select' && (
                      <select value={value} onChange={(e) => setForm((f) => ({ ...f, customFieldValues: { ...f.customFieldValues, [field.key]: e.target.value || undefined } }))} required={field.required} className={inputCls}>
                        <option value="">—</option>
                        {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                    {field.fieldType === 'multiselect' && (
                      <select
                        multiple
                        value={Array.isArray(val) ? val : value ? [value] : []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                          setForm((f) => ({ ...f, customFieldValues: { ...f.customFieldValues, [field.key]: selected.length ? selected : undefined } }));
                        }}
                        className={inputCls}
                      >
                        {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                    {field.fieldType === 'user' && (
                      <select value={value} onChange={(e) => setForm((f) => ({ ...f, customFieldValues: { ...f.customFieldValues, [field.key]: e.target.value || undefined } }))} required={field.required} className={inputCls}>
                        <option value="">—</option>
                        {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)]">Cancel</button>
            <button type="submit" disabled={submitting} className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)] disabled:opacity-50">{submitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

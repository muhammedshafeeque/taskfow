import { useEffect, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  issuesApi,
  sprintsApi,
  projectsApi,
  type Issue,
  type Sprint,
  type Project,
  getIssueKey,
} from '../lib/api';
import { MetaBadge } from '../components/MetaBadge';

const BACKLOG_ID = '__backlog__';

function BacklogCard({
  issue,
  projectId,
  getIssueKeyFn,
  getTypeMeta,
  getPriorityMeta,
}: {
  issue: Issue;
  projectId: string;
  getIssueKeyFn: (issue: Issue) => string;
  getTypeMeta: (name: string) => { icon?: string; color?: string } | undefined;
  getPriorityMeta: (name: string) => { icon?: string; color?: string } | undefined;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue._id,
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 min-w-0 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-3 ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <button
        type="button"
        className="shrink-0 touch-none cursor-grab active:cursor-grabbing text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] p-0.5 -m-0.5"
        aria-label="Drag to reorder"
        {...listeners}
        {...attributes}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
          <path d="M5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
        </svg>
      </button>
      <Link
        to={`/projects/${projectId}/issues/${encodeURIComponent(getIssueKeyFn(issue))}`}
        className="flex-1 min-w-0 block text-left"
      >
        <p className="text-[11px] font-mono text-[color:var(--text-muted)]">{getIssueKeyFn(issue)}</p>
        <p className="text-sm font-medium text-[color:var(--text-primary)] truncate">{issue.title}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <MetaBadge label={issue.type} meta={getTypeMeta(issue.type)} />
          <MetaBadge label={issue.priority} meta={getPriorityMeta(issue.priority)} />
          {issue.storyPoints != null && (
            <span className="text-[10px] text-[color:var(--text-muted)]">{issue.storyPoints} SP</span>
          )}
        </div>
      </Link>
    </div>
  );
}

function BacklogColumn({
  id,
  title,
  count,
  children,
  getStatusMeta,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  getStatusMeta: (name: string) => { icon?: string; color?: string } | undefined;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const statusMeta = getStatusMeta(title);
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[320px] max-w-[480px] rounded-xl border transition-colors ${
        isOver
          ? 'border-[color:var(--accent)] ring-1 ring-[color:var(--accent)]/40'
          : 'border-[color:var(--border-subtle)]'
      } bg-[color:var(--bg-surface)]`}
    >
      <div className="p-4 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] rounded-t-xl">
        <div className="flex items-center gap-2">
          {statusMeta && (
            <MetaBadge label={title} meta={statusMeta} />
          )}
          {!statusMeta && (
            <span className="text-sm font-semibold text-[color:var(--text-primary)]">{title}</span>
          )}
          <span className="text-[11px] text-[color:var(--text-muted)]">{count} issues</span>
        </div>
      </div>
      <div className="p-3 min-h-[200px] space-y-2">{children}</div>
    </div>
  );
}

export default function Backlog() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [sprintIssues, setSprintIssues] = useState<Issue[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refresh = () => {
    if (!token || !projectId) return;
    setLoading(true);
    Promise.all([
      issuesApi.list({ page: 1, limit: 500, token, project: projectId, sprint: 'backlog' }),
      sprintsApi.list(1, 10, projectId, undefined, token, 'active'),
      projectsApi.get(projectId, token),
    ]).then(([backlogRes, sprintsRes, projectRes]) => {
      setLoading(false);
      if (backlogRes.success && backlogRes.data) setBacklogIssues(backlogRes.data.data);
      if (sprintsRes.success && sprintsRes.data && sprintsRes.data.data.length > 0) {
        const active = sprintsRes.data.data[0] as Sprint;
        setActiveSprint(active);
        issuesApi.list({ page: 1, limit: 500, token, project: projectId, sprint: active._id }).then((r) => {
          if (r.success && r.data) setSprintIssues(r.data.data);
        });
      } else {
        setActiveSprint(null);
        setSprintIssues([]);
      }
      if (projectRes.success && projectRes.data) setProject(projectRes.data);
    });
  };

  useEffect(() => {
    if (!projectId) {
      navigate('/projects', { replace: true });
      return;
    }
  }, [projectId, navigate]);

  useEffect(() => {
    refresh();
  }, [token, projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !token || !projectId) return;
    const issueId = String(active.id);

    if (over.id === BACKLOG_ID) {
      const inBacklog = backlogIssues.some((i) => i._id === issueId);
      if (inBacklog) return;
      setUpdatingId(issueId);
      const res = await issuesApi.update(issueId, { sprint: null }, token);
      setUpdatingId(null);
      if (res.success) refresh();
      return;
    }

    const sprintId = activeSprint?._id;
    const droppedOnSprint = over.id === sprintId || sprintIssues.some((i) => i._id === over.id);
    if (sprintId && droppedOnSprint) {
      const inSprint = sprintIssues.some((i) => i._id === issueId);
      if (inSprint) return;
      setUpdatingId(issueId);
      const res = await issuesApi.update(issueId, { sprint: sprintId }, token);
      setUpdatingId(null);
      if (res.success) refresh();
      return;
    }

    const overId = String(over.id);
    const overIdx = backlogIssues.findIndex((i) => i._id === overId);
    const activeIdx = backlogIssues.findIndex((i) => i._id === issueId);
    if (overIdx < 0 || activeIdx < 0) return;

    const newOrder = [...backlogIssues];
    const [removed] = newOrder.splice(activeIdx, 1);
    newOrder.splice(overIdx, 0, removed);
    const issueIds = newOrder.map((i) => i._id);
    setUpdatingId(issueId);
    const res = await issuesApi.updateBacklogOrder(issueIds, token);
    setUpdatingId(null);
    if (res.success) setBacklogIssues(newOrder);
  }

  const getTypeMeta = (name: string) => project?.issueTypes?.find((t) => t.name === name);
  const getPriorityMeta = (name: string) => project?.priorities?.find((p) => p.name === name);
  const getStatusMeta = (name: string) => project?.statuses?.find((s) => s.name === name);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--text-primary)]">Backlog</h1>
        <Link
          to={`/projects/${projectId}/sprints`}
          className="text-sm text-[color:var(--accent)] hover:underline"
        >
          Manage sprints →
        </Link>
      </div>

      {loading ? (
        <div className="text-[color:var(--text-muted)] animate-pulse">Loading…</div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            <BacklogColumn
              id={BACKLOG_ID}
              title="Backlog"
              count={backlogIssues.length}
              getStatusMeta={getStatusMeta ?? (() => undefined)}
            >
              {backlogIssues.map((issue) => (
                <div key={issue._id} className={updatingId === issue._id ? 'opacity-50' : ''}>
                  <BacklogCard
                    issue={issue}
                    projectId={projectId!}
                    getIssueKeyFn={getIssueKey}
                    getTypeMeta={getTypeMeta ?? (() => undefined)}
                    getPriorityMeta={getPriorityMeta ?? (() => undefined)}
                  />
                </div>
              ))}
            </BacklogColumn>

            <BacklogColumn
              id={activeSprint ? String(activeSprint._id) : '__sprint_empty__'}
              title={activeSprint?.name ?? 'Sprint (none active)'}
              count={sprintIssues.length}
              getStatusMeta={getStatusMeta ?? (() => undefined)}
            >
              {sprintIssues.map((issue) => (
                <div key={issue._id} className={updatingId === issue._id ? 'opacity-50' : ''}>
                  <BacklogCard
                    issue={issue}
                    projectId={projectId!}
                    getIssueKeyFn={getIssueKey}
                    getTypeMeta={getTypeMeta ?? (() => undefined)}
                    getPriorityMeta={getPriorityMeta ?? (() => undefined)}
                  />
                </div>
              ))}
            </BacklogColumn>
          </div>
        </DndContext>
      )}

      <p className="mt-4 text-xs text-[color:var(--text-muted)]">
        Drag issues to reorder in the backlog or move between Backlog and Sprint.
      </p>
    </div>
  );
}

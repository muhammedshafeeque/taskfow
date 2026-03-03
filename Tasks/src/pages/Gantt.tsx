import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { issuesApi, projectsApi, getIssueKey, type Issue, type Project } from '../lib/api';
import FrappeGantt from 'frappe-gantt';

export default function GanttPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<InstanceType<typeof FrappeGantt> | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !projectId) return;
    setLoading(true);
    Promise.all([
      projectsApi.get(projectId, token),
      issuesApi.list({ project: projectId, limit: 500, token }),
    ]).then(([projRes, issuesRes]) => {
      setLoading(false);
      if (projRes.success && projRes.data) setProject(projRes.data);
      if (issuesRes.success && issuesRes.data) setIssues(issuesRes.data.data);
    });
  }, [token, projectId]);

  const tasksWithDates = issues.filter((i) => i.startDate || i.dueDate);

  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateHeight = () => {
      const h = el.offsetHeight || el.getBoundingClientRect().height;
      if (h > 0) setContainerHeight(h);
    };
    updateHeight();
    const ro = new ResizeObserver((entries) => {
      const { height } = entries[0]?.contentRect ?? {};
      if (height && height > 0) setContainerHeight(height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tasksWithDates.length]);

  useEffect(() => {
    if (!containerRef.current || tasksWithDates.length === 0 || containerHeight <= 0) {
      if (ganttRef.current && containerRef.current) {
        ganttRef.current.clear?.();
        ganttRef.current = null;
      }
      return;
    }

    const ganttTasks = tasksWithDates.map((issue) => {
      let start: string;
      let end: string;
      if (issue.startDate && issue.dueDate) {
        start = issue.startDate.split('T')[0];
        end = issue.dueDate.split('T')[0];
      } else if (issue.dueDate) {
        end = issue.dueDate.split('T')[0];
        const d = new Date(end);
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split('T')[0];
      } else {
        start = issue.startDate!.split('T')[0];
        const d = new Date(start);
        d.setDate(d.getDate() + 1);
        end = d.toISOString().split('T')[0];
      }
      const status = issue.status?.toLowerCase() ?? '';
      const progress = status === 'done' ? 100 : status === 'in progress' ? 50 : 0;
      return {
        id: issue._id,
        name: `${getIssueKey(issue)} ${issue.title}`.slice(0, 60),
        start,
        end,
        progress,
      };
    });

    if (ganttRef.current) {
      ganttRef.current.clear?.();
      ganttRef.current = null;
    }

    const container = containerRef.current;
    if (!container) return;

    const gantt = new FrappeGantt(container, ganttTasks, {
      view_mode: 'Month',
      view_modes: ['Day', 'Week', 'Month'],
      readonly: true,
      container_height: containerHeight,
      on_click: (task: { id: string }) => {
        const issue = issues.find((i) => i._id === task.id);
        if (issue && projectId) {
          const key = getIssueKey(issue);
          navigate(`/projects/${projectId}/issues/${encodeURIComponent(key)}`);
        }
      },
    });
    ganttRef.current = gantt;

    return () => {
      gantt.clear?.();
      ganttRef.current = null;
    };
  }, [tasksWithDates, issues, projectId, navigate, containerHeight]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-[color:var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Gantt {project ? `· ${project.name}` : ''}
        </h1>
      </div>
      {tasksWithDates.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted)]">
          No issues with start or due dates. Add start date and due date to issues to see them on the Gantt chart.
        </p>
      ) : (
        <div ref={containerRef} className="gantt-wrapper flex-1 min-h-0" />
      )}
    </div>
  );
}

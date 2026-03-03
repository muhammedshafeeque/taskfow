import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsApi, roadmapsApi, milestonesApi, type Project, type Roadmap, type Milestone } from '../lib/api';
import FrappeGantt from 'frappe-gantt';

export default function RoadmapPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<InstanceType<typeof FrappeGantt> | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!token || !projectId) return;
    setLoading(true);
    Promise.all([
      projectsApi.get(projectId, token),
      roadmapsApi.list(projectId, token),
      milestonesApi.list(projectId, token),
    ]).then(([projRes, roadRes, mileRes]) => {
      setLoading(false);
      if (projRes.success && projRes.data) setProject(projRes.data);
      if (roadRes.success && roadRes.data) {
        setRoadmaps(Array.isArray(roadRes.data) ? roadRes.data : []);
        if (roadRes.data?.length && !selectedRoadmapId) {
          setSelectedRoadmapId(roadRes.data[0]._id);
        }
      }
      if (mileRes.success && mileRes.data) setAllMilestones(Array.isArray(mileRes.data) ? mileRes.data : []);
    });
  }, [token, projectId]);

  useEffect(() => {
    if (!token || !projectId || !selectedRoadmapId) {
      setMilestones([]);
      return;
    }
    roadmapsApi.getMilestones(projectId, selectedRoadmapId, token).then((res) => {
      if (res.success && res.data) setMilestones(Array.isArray(res.data) ? res.data : []);
      else setMilestones([]);
    });
  }, [token, projectId, selectedRoadmapId]);

  const milestonesToShow = !selectedRoadmapId ? allMilestones : milestones;
  const tasksWithDates = milestonesToShow.filter((m) => m.dueDate);

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

    const ganttTasks = tasksWithDates.map((m) => {
      const due = m.dueDate ? new Date(m.dueDate) : new Date();
      const start = new Date(due);
      start.setDate(start.getDate() - 7);
      const status = (m.status ?? '').toLowerCase();
      const progress = status === 'done' ? 100 : status === 'in progress' ? 50 : 0;
      return {
        id: m._id,
        name: m.name.slice(0, 60),
        start: start.toISOString().split('T')[0],
        end: due.toISOString().split('T')[0],
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
    });
    ganttRef.current = gantt;

    return () => {
      gantt.clear?.();
      ganttRef.current = null;
    };
  }, [tasksWithDates, containerHeight]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-[color:var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col p-6">
      <div className="mb-4 flex shrink-0 items-center justify-between flex-wrap gap-4">
        <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Roadmap {project ? `· ${project.name}` : ''}
        </h1>
        {roadmaps.length > 1 && (
          <select
            value={selectedRoadmapId ?? ''}
            onChange={(e) => setSelectedRoadmapId(e.target.value || null)}
            className="px-3 py-1.5 rounded-md bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] text-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40"
          >
            <option value="">All milestones</option>
            {roadmaps.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {tasksWithDates.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted)]">
          No milestones with due dates. Add milestones in Project Settings and set due dates to see them on the roadmap.
        </p>
      ) : (
        <div ref={containerRef} className="gantt-wrapper flex-1 min-h-0" />
      )}
    </div>
  );
}

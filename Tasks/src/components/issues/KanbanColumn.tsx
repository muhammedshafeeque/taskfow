import { useDroppable } from '@dnd-kit/core';
import { MetaBadge } from '../MetaBadge';

interface KanbanColumnProps {
  status: string;
  count: number;
  getStatusMeta: (name: string) => { icon?: string; color?: string } | undefined;
  children: React.ReactNode;
}

export function KanbanColumn({ status, count, getStatusMeta, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const statusMeta = getStatusMeta(status);
  return (
    <div
      ref={setNodeRef}
      className={`w-[280px] shrink-0 rounded-lg overflow-hidden transition-all border card-shadow ${
        isOver
          ? 'border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/50 ring-offset-2 ring-offset-[color:var(--bg-page)]'
          : 'border-[color:var(--border-subtle)]'
      } bg-[color:var(--bg-surface)]`}
    >
      <div className="kanban-col-header justify-between">
        <div className="flex items-center gap-2">
          <MetaBadge label={status} meta={statusMeta} />
        </div>
        <span className="ml-auto bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-[color:var(--text-muted)]">{count}</span>
      </div>
      <div className="p-2.5 min-h-[120px] space-y-2.5">{children}</div>
    </div>
  );
}

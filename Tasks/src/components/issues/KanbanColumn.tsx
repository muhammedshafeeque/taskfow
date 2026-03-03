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
      className={`w-72 shrink-0 rounded-xl overflow-hidden transition-colors border ${
        isOver
          ? 'border-[color:var(--accent)] ring-1 ring-[color:var(--accent)]/40'
          : 'border-[color:var(--border-subtle)]'
      } bg-[color:var(--bg-surface)]`}
    >
      <div className="p-3 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)]">
        <div className="flex items-center gap-2">
          <MetaBadge label={status} meta={statusMeta} />
          <span className="text-[11px] text-[color:var(--text-muted)]">{count} issue(s)</span>
        </div>
      </div>
      <div className="p-2 min-h-[120px] space-y-2">{children}</div>
    </div>
  );
}

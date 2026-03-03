import React from 'react';
import { createPortal } from 'react-dom';
import { ISSUE_TABLE_COLUMNS } from './constants';

interface ColumnsConfigModalProps {
  columnsOpen: boolean;
  setColumnsOpen: (v: boolean) => void;
  columnsConfig: { order: string[]; visible: Record<string, boolean> };
  toggleColumn: (id: string) => void;
  moveColumnAt: (dragIndex: number, dropIndex: number) => void;
  resetColumns: () => void;
  columnDragId: string | null;
  setColumnDragId: (id: string | null) => void;
  columnDropIndex: number | null;
  setColumnDropIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export function ColumnsConfigModal({
  columnsOpen,
  setColumnsOpen,
  columnsConfig,
  toggleColumn,
  moveColumnAt,
  resetColumns,
  columnDragId,
  setColumnDragId,
  columnDropIndex,
  setColumnDropIndex,
}: ColumnsConfigModalProps) {
  if (!columnsOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={() => setColumnsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-[color:var(--text-primary)] mb-2">Table columns</h2>
        <p className="text-xs text-[color:var(--text-muted)] mb-4">
          Select and reorder columns. Drag the handle to change order. Changes are saved automatically.
        </p>
        <ul className="space-y-1 max-h-80 overflow-y-auto">
          {columnsConfig.order.map((colId, index) => {
            const col = ISSUE_TABLE_COLUMNS.find((c) => c.id === colId);
            const label = col?.label ?? colId;
            const isVisible = columnsConfig.visible[colId];
            const isDragging = columnDragId === colId;
            const isDropTarget = columnDropIndex === index;
            return (
              <li
                key={colId}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition ${
                  isDragging ? 'bg-[color:var(--bg-surface)] border-[color:var(--accent)] opacity-60'
                    : isDropTarget ? 'bg-[color:var(--bg-page)] border-[color:var(--accent)] border-dashed'
                    : 'bg-[color:var(--bg-surface)] border-[color:var(--border-subtle)]'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (columnDragId && columnDragId !== colId) setColumnDropIndex(index);
                }}
                onDragLeave={() => setColumnDropIndex((prev: number | null) => (prev === index ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragId = e.dataTransfer.getData('text/plain');
                  if (!dragId) return;
                  const dragIndex = columnsConfig.order.indexOf(dragId);
                  if (dragIndex !== -1 && dragIndex !== index) moveColumnAt(dragIndex, index);
                  setColumnDragId(null);
                  setColumnDropIndex(null);
                }}
              >
                <div
                  draggable
                  onDragStart={(e) => {
                    setColumnDragId(colId);
                    setColumnDropIndex(null);
                    e.dataTransfer.setData('text/plain', colId);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => {
                    setColumnDragId(null);
                    setColumnDropIndex(null);
                  }}
                  className="cursor-grab active:cursor-grabbing p-1 -m-1 rounded text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] touch-none"
                  title="Drag to reorder"
                >
                  <span className="inline-block select-none" aria-hidden>⋮⋮</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleColumn(colId)}
                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                >
                  <span className={`w-4 h-4 rounded border flex shrink-0 items-center justify-center text-[10px] ${isVisible ? 'border-[color:var(--accent)] bg-[color:var(--bg-page)]' : 'border-[color:var(--border-subtle)]'}`}>
                    {isVisible && '✓'}
                  </span>
                  <span className="text-xs text-[color:var(--text-primary)] truncate">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={resetColumns}
            className="px-3 py-1.5 rounded-md text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--bg-page)] hover:text-[color:var(--text-primary)]"
          >
            Reset to default
          </button>
          <button
            type="button"
            onClick={() => setColumnsOpen(false)}
            className="px-3 py-1.5 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-xs text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)] font-medium ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

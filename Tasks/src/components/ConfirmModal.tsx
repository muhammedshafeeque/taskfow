import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmClass =
    variant === 'danger'
      ? 'px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition'
      : 'px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-[color:var(--bg-modal)] border border-[color:var(--border-subtle)] rounded-2xl p-6 shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[color:var(--text-primary)] mb-2">{title}</h2>
        <div className="text-[color:var(--text-muted)] text-sm mb-6">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg btn-secondary border hover:opacity-90 transition"
          >
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={confirmClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

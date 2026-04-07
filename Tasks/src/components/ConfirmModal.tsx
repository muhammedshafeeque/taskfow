import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { FiCheck, FiTrash2, FiX } from 'react-icons/fi';

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
      ? 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]'
      : 'btn-primary inline-flex items-center justify-center gap-1.5';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-[color:var(--bg-modal)] border border-[color:var(--border-subtle)] rounded-xl p-6 card-shadow shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-[color:var(--text-primary)] mb-2">{title}</h2>
        <div className="text-[color:var(--text-muted)] text-sm mb-6">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg btn-secondary border hover:opacity-90 transition"
          >
            <FiX className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={confirmClass}>
            {variant === 'danger' ? (
              <FiTrash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <FiCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

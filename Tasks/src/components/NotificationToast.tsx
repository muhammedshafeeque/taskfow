import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export interface NotificationToastProps {
  title: string;
  body?: string;
  url?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function NotificationToast({
  title,
  body,
  url,
  onDismiss,
  autoDismissMs = 6000,
}: NotificationToastProps) {
  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs, onDismiss]);

  let path = url || '/inbox';
  if (url?.startsWith('http')) {
    try {
      path = new URL(url).pathname;
    } catch {
      path = url;
    }
  }

  const content = (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-medium text-sm text-[color:var(--text-primary)] truncate">{title}</span>
      {body && (
        <span className="text-xs text-[color:var(--text-muted)] line-clamp-2">{body}</span>
      )}
    </div>
  );

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-3 rounded-lg bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] shadow-lg max-w-sm animate-fade-in"
    >
      <div className="flex-1 min-w-0">
        {path ? (
          <Link
            to={path}
            onClick={onDismiss}
            className="block hover:opacity-90 transition"
          >
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 p-1 rounded text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface)] transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

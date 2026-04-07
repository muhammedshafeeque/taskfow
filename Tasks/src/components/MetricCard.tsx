import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: ReactNode;
  helperText?: string;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  helperText,
  icon,
  loading = false,
  className = '',
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] px-5 py-4 card-shadow hover-elevated ${className}`}
    >
      <div className="h-0.5 w-8 rounded-full bg-[color:var(--accent)] mb-3 opacity-80" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[color:var(--text-muted)] mb-1.5">
            {title}
          </p>
          {loading ? (
            <div className="mt-1 h-6 w-16 rounded-full skeleton" />
          ) : (
            <p className="text-2xl font-bold text-[color:var(--text-primary)]">
              {value}
            </p>
          )}
          {helperText && (
            <p className="text-[11px] text-[color:var(--text-muted)] mt-1">
              {helperText}
            </p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 text-[color:var(--accent)] opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}


import { FiEye, FiEyeOff } from 'react-icons/fi';

interface WatchButtonProps {
  watching: boolean;
  loading?: boolean;
  onWatch: () => void;
  onUnwatch: () => void;
  size?: 'sm' | 'md';
  label?: boolean;
}

export default function WatchButton({
  watching,
  loading = false,
  onWatch,
  onUnwatch,
  size = 'md',
  label = false,
}: WatchButtonProps) {
  const iconSize = size === 'sm' ? 14 : 16;
  const Icon = watching ? FiEye : FiEyeOff;

  const handleClick = () => {
    if (loading) return;
    watching ? onUnwatch() : onWatch();
  };

  const baseClass =
    'inline-flex items-center gap-1.5 rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]/40 focus:ring-offset-0';
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs';
  const stateClass = watching
    ? 'border-[color:var(--border-subtle)] bg-[color:var(--accent)]/20 text-[color:var(--accent)] font-medium hover:bg-[color:var(--accent)]/30'
    : 'border-[color:var(--border-subtle)] bg-[color:var(--bg-page)] text-[color:var(--text-muted)] font-medium hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--text-primary)]';
  const disabledClass = loading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={watching ? 'Stop watching' : 'Watch'}
      title={watching ? 'Stop watching' : 'Watch'}
      className={`${baseClass} ${sizeClass} ${stateClass} ${disabledClass}`}
    >
      {loading ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Icon className="shrink-0" style={{ width: iconSize, height: iconSize }} />
      )}
      {label && (
        <span>{loading ? '…' : watching ? 'Watching' : 'Watch'}</span>
      )}
    </button>
  );
}

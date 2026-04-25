/** Absolute URL for the standalone workspace & settings window (respects Vite `base`). */
export function taskflowAppSettingsHref(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const trimmed = base === '/' ? '' : base.replace(/\/$/, '');
  return `${window.location.origin}${trimmed}/app-settings`;
}

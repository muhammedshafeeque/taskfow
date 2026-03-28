/** Calendar date in local timezone; avoids UTC shift for `YYYY-MM-DD` strings. */
export function parseToLocalDate(input: Date | string): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  const s = String(input).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** `YYYY-MM-DD` from a local calendar date. */
export function toIsoDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayIsoDate(): string {
  return toIsoDateString(new Date());
}

/** First 10 chars as `YYYY-MM-DD` if present, else derive from parsed date. */
export function toIsoDatePart(value: string | undefined | null): string {
  if (!value) return '';
  const s = String(value).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = parseToLocalDate(s);
  return d ? toIsoDateString(d) : '';
}

/** Display as DD/MM/YYYY. */
export function formatDateDDMMYYYY(input: Date | string | null | undefined): string {
  if (input == null || input === '') return '—';
  const d = typeof input === 'string' ? parseToLocalDate(input) : input;
  if (!d || Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Parse DD/MM/YYYY or DD-MM-YYYY → `YYYY-MM-DD`, or null if invalid. */
export function parseDDMMYYYYToIso(s: string): string | null {
  const trimmed = s.trim();
  const m = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(year, month - 1, day);
  if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) return null;
  return toIsoDateString(dt);
}

/** ISO `YYYY-MM-DD` → `DD/MM/YYYY` for inputs; empty string if no value. */
export function isoDateToDisplayDDMMYYYY(iso: string): string {
  if (!iso?.trim()) return '';
  const d = parseToLocalDate(iso.trim());
  if (!d) return '';
  const s = formatDateDDMMYYYY(d);
  return s === '—' ? '' : s;
}

export function formatDateTimeDDMMYYYY(input: Date | string | null | undefined): string {
  if (input == null || input === '') return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  const datePart = formatDateDDMMYYYY(d);
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${datePart} ${timePart}`;
}

/** Long header e.g. "Saturday 28/03/2026" for timesheet modal. */
export function formatWeekdayDateDDMMYYYY(isoDate: string): string {
  const d = parseToLocalDate(isoDate);
  if (!d) return '—';
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${weekday} ${formatDateDDMMYYYY(d)}`;
}

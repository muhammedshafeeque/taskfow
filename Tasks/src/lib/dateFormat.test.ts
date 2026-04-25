import {
  formatDateDDMMYYYY,
  formatDateTimeDDMMYYYY,
  formatWeekdayDateDDMMYYYY,
  isoDateToDisplayDDMMYYYY,
  parseDDMMYYYYToIso,
  parseToLocalDate,
  toIsoDateString,
  toIsoDatePart,
  todayIsoDate,
} from './dateFormat';

describe('dateFormat helpers', () => {
  it('parses valid YYYY-MM-DD as local date', () => {
    const parsed = parseToLocalDate('2026-04-24');
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(3);
    expect(parsed?.getDate()).toBe(24);
  });

  it('returns null for invalid date input', () => {
    expect(parseToLocalDate('2026-02-31')).toBeNull();
  });

  it('converts DD/MM/YYYY to ISO', () => {
    expect(parseDDMMYYYYToIso('24/04/2026')).toBe('2026-04-24');
    expect(parseDDMMYYYYToIso('31/02/2026')).toBeNull();
  });

  it('formats date to DD/MM/YYYY and handles empty values', () => {
    expect(formatDateDDMMYYYY('2026-04-24')).toBe('24/04/2026');
    expect(formatDateDDMMYYYY('')).toBe('—');
  });

  it('extracts ISO date part and formats weekday label', () => {
    expect(toIsoDatePart('2026-04-24T10:20:30.000Z')).toBe('2026-04-24');
    expect(formatWeekdayDateDDMMYYYY('2026-04-24')).toContain('24/04/2026');
  });

  it('covers remaining date helpers', () => {
    const date = new Date(2026, 3, 24, 9, 15, 30);
    expect(toIsoDateString(date)).toBe('2026-04-24');
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isoDateToDisplayDDMMYYYY('2026-04-24')).toBe('24/04/2026');
    expect(formatDateTimeDDMMYYYY('2026-04-24T09:15:30.000Z')).toContain('24/04/2026');
  });
});

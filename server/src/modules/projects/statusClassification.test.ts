import {
  getClosedStatusNamesFromStatuses,
  inferClosedFromName,
  isClosedStatus,
} from './statusClassification';

describe('statusClassification', () => {
  it('infers closed status names from legacy keywords', () => {
    expect(inferClosedFromName('Done')).toBe(true);
    expect(inferClosedFromName('Resolved by QA')).toBe(true);
    expect(inferClosedFromName('In Progress')).toBe(false);
  });

  it('prefers configured isClosed flag over name inference', () => {
    const statuses = [
      { name: 'Done', isClosed: false },
      { name: 'Review', isClosed: true },
    ];

    expect(isClosedStatus('Done', statuses)).toBe(false);
    expect(isClosedStatus('Review', statuses)).toBe(true);
  });

  it('returns fallback closed names when statuses are empty', () => {
    expect(getClosedStatusNamesFromStatuses([])).toEqual(['Done', 'Closed', 'Resolved']);
  });

  it('collects only closed statuses from configured list', () => {
    const statuses = [
      { name: 'Backlog', isClosed: false },
      { name: 'Done', isClosed: true },
      { name: 'Resolved', isClosed: true },
    ];

    expect(getClosedStatusNamesFromStatuses(statuses)).toEqual(['Done', 'Resolved']);
  });
});

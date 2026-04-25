import { queryToFilters } from './issues.service';

describe('queryToFilters', () => {
  it('maps query fields directly and normalizes boolean-like flags', () => {
    const result = queryToFilters({
      project: 'project-1',
      status: 'Open',
      statusExclude: 'Done',
      assignee: 'user-1',
      reporter: 'user-2',
      sprint: 'sprint-1',
      type: 'Bug',
      priority: 'High',
      labels: 'backend,urgent',
      storyPoints: '3,5',
      hasStoryPoints: 'false',
      hasEstimate: 'true',
      fixVersion: 'v1.0.0',
    });

    expect(result).toEqual({
      project: 'project-1',
      status: 'Open',
      statusExclude: 'Done',
      assignee: 'user-1',
      reporter: 'user-2',
      sprint: 'sprint-1',
      type: 'Bug',
      priority: 'High',
      labels: 'backend,urgent',
      storyPoints: '3,5',
      hasStoryPoints: false,
      hasEstimate: true,
      fixVersion: 'v1.0.0',
    });
  });

  it('returns undefined flags when not explicitly provided', () => {
    const result = queryToFilters({});
    expect(result.hasEstimate).toBeUndefined();
    expect(result.hasStoryPoints).toBeUndefined();
  });
});

import { mergeTaskflowPermissionFloor } from './permissionMerge';
import { DEFAULT_USER_PERMISSIONS } from '../../shared/constants/permissions';

describe('mergeTaskflowPermissionFloor', () => {
  it('always includes default permission floor', () => {
    const result = mergeTaskflowPermissionFloor([]);
    expect(result).toEqual(expect.arrayContaining(DEFAULT_USER_PERMISSIONS));
  });

  it('preserves incoming permissions and de-duplicates', () => {
    const result = mergeTaskflowPermissionFloor([
      'issue.issue.create',
      'issue.issue.create',
      DEFAULT_USER_PERMISSIONS[0],
    ]);

    expect(result).toContain('issue.issue.create');
    expect(new Set(result).size).toBe(result.length);
  });
});

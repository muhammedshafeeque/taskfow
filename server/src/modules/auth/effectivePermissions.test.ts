import { resolveEffectiveGlobalPermissions } from './effectivePermissions';
import { ALL_TASK_FLOW_PERMISSIONS } from '../../shared/constants/permissions';

describe('resolveEffectiveGlobalPermissions', () => {
  it('falls back to full TaskFlow permissions for admin without role permissions', () => {
    const result = resolveEffectiveGlobalPermissions({
      role: 'admin',
      rolePermissions: [],
    });

    expect(result).toEqual(expect.arrayContaining(ALL_TASK_FLOW_PERMISSIONS));
  });

  it('applies granted and revoked permission overrides', () => {
    const result = resolveEffectiveGlobalPermissions({
      role: 'user',
      rolePermissions: ['project.read', 'issue.issue.create'],
      permissionOverrides: {
        granted: ['user.manage'],
        revoked: ['project.read'],
      },
    });

    expect(result).toContain('user.manage');
    expect(result).not.toContain('project.read');
  });

  it('implicitly adds auth.user.list when issue.issue.create is present', () => {
    const result = resolveEffectiveGlobalPermissions({
      role: 'user',
      rolePermissions: ['issue.issue.create'],
    });

    expect(result).toContain('issue.issue.create');
    expect(result).toContain('auth.user.list');
  });
});

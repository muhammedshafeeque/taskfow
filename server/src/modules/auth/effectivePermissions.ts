import { PERMISSION_CODES } from '../../constants/permissions';

/**
 * Resolve global permissions from role payload and user type.
 * Admin users fall back to full permission set when role permissions are empty.
 */
export function resolveEffectiveGlobalPermissions(input: {
  rolePermissions?: string[] | null;
  role: 'user' | 'admin';
  mustChangePassword?: boolean;
}): string[] {
  const basePermissions = Array.isArray(input.rolePermissions) ? [...input.rolePermissions] : [];
  const withAdminFallback =
    basePermissions.length === 0 && input.role === 'admin' ? [...PERMISSION_CODES] : basePermissions;

  // If a user can create issues, they must also be able to list users
  // so that assignee dropdowns and similar flows don't hit 403s.
  if (withAdminFallback.includes('issues:create') && !withAdminFallback.includes('users:list')) {
    withAdminFallback.push('users:list');
  }

  if (input.mustChangePassword && withAdminFallback.includes('projects:create')) {
    return withAdminFallback.filter((p) => p !== 'projects:create');
  }
  return withAdminFallback;
}

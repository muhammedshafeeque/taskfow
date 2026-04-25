import { TASKFLOW_ACTIVE_ORG_STORAGE_KEY, type AuthUser } from './api';

export async function resolvePostAuthRoute(
  user: AuthUser,
  switchWorkspace: (organizationId: string) => Promise<{ ok: boolean; error?: string }>
): Promise<string> {
  if (user.userType === 'customer') return '/portal';
  const organizations = user.organizations ?? [];
  if (organizations.length === 0) return '/app-settings';

  const lastUsed = localStorage.getItem(TASKFLOW_ACTIVE_ORG_STORAGE_KEY) ?? '';
  if (organizations.length === 1) {
    const onlyId = organizations[0].id;
    if (onlyId && user.activeOrganizationId !== onlyId) {
      await switchWorkspace(onlyId);
    }
    return '/';
  }

  if (lastUsed && organizations.some((o) => o.id === lastUsed) && user.activeOrganizationId !== lastUsed) {
    const switched = await switchWorkspace(lastUsed);
    if (!switched.ok) return '/app-settings';
  }
  return '/';
}

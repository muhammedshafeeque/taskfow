import { Outlet } from 'react-router-dom';

/**
 * Renders child routes for /projects/:projectId/*.
 * Layout (single sidebar) is provided by TaskflowAppShell and fetches project from URL.
 */
export default function ProjectLayout() {
  return <Outlet />;
}

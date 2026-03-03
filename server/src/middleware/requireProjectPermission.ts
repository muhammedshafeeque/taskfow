import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { ProjectMember } from '../modules/projects/projectMember.model';
import { Role } from '../modules/roles/role.model';
import type { PermissionCode } from '../constants/permissions';

export type ProjectIdSource = { param?: string; query?: string };

const DEFAULT_PROJECT_ID_SOURCES = [{ param: 'id' }, { query: 'project' }];

export function requireProjectPermission(
  permission: PermissionCode,
  projectIdSource?: ProjectIdSource
) {
  const sources = projectIdSource ? [projectIdSource] : DEFAULT_PROJECT_ID_SOURCES;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    let projectId: string | undefined;
    for (const src of sources) {
      if (src.param && req.params[src.param]) {
        projectId = req.params[src.param];
        break;
      }
      if (src.query && req.query[src.query]) {
        projectId = String(req.query[src.query]);
        break;
      }
    }

    if (!projectId) {
      next(new ApiError(400, 'Project context required'));
      return;
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(req.user.id) ? new mongoose.Types.ObjectId(req.user.id) : req.user.id;
    const member = await ProjectMember.findOne({ project: projectId, user: userObjectId })
      .populate('role', 'permissions')
      .lean();

    if (!member) {
      next(new ApiError(403, 'You are not a member of this project'));
      return;
    }

    const role = member.role as { permissions?: string[] } | null;
    const permissions = Array.isArray(role?.permissions) ? role.permissions : [];

    if (!permissions.includes(permission)) {
      next(new ApiError(403, 'Insufficient permissions for this project'));
      return;
    }

    (req as Request & { projectPermissions?: string[] }).projectPermissions = permissions;
    next();
  };
}

export async function getProjectPermissionsForUser(
  projectId: string,
  userId: string
): Promise<string[]> {
  const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const member = await ProjectMember.findOne({ project: projectId, user: userObjectId })
    .populate('role', 'permissions')
    .lean();
  if (!member) return [];
  const role = member.role as { permissions?: string[] } | null;
  return Array.isArray(role?.permissions) ? role.permissions : [];
}

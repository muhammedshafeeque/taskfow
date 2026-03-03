import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import type { PermissionCode } from '../constants/permissions';

export function requirePermission(permission: PermissionCode) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }
    const permissions = req.user.permissions ?? [];
    if (!permissions.includes(permission)) {
      next(new ApiError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
}

export function requireAnyPermission(permissions: PermissionCode[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }
    const userPerms = req.user.permissions ?? [];
    if (!permissions.some((p) => userPerms.includes(p))) {
      next(new ApiError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
}

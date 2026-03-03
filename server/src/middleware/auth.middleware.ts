import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { User } from '../modules/auth/user.model';
import { PERMISSION_CODES } from '../constants/permissions';
import type { AuthPayload } from '../types/express';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await User.findById(decoded.sub).populate('roleId', 'permissions').lean();
    if (!user) {
      next(new ApiError(401, 'User not found'));
      return;
    }
    const u = user as { enabled?: boolean };
    if (u.enabled === false) {
      next(new ApiError(401, 'Account is disabled'));
      return;
    }
    const role = user.roleId as { _id?: { toString(): string }; permissions?: string[] } | null | undefined;
    let permissions = Array.isArray(role?.permissions) ? role.permissions : [];
    if (permissions.length === 0 && user.role === 'admin') {
      permissions = [...PERMISSION_CODES];
    }
    const mustChangePassword = user.mustChangePassword ?? false;
    if (mustChangePassword && permissions.includes('projects:create')) {
      permissions = permissions.filter((p) => p !== 'projects:create');
    }
    const roleIdStr =
      user.roleId && typeof user.roleId === 'object' && '_id' in user.roleId
        ? (user.roleId as { _id: { toString(): string } })._id.toString()
        : user.roleId
          ? String(user.roleId)
          : undefined;
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: roleIdStr,
      permissions,
      mustChangePassword: user.mustChangePassword ?? false,
    };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

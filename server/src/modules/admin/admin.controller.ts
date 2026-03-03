import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { ApiError } from '../../utils/ApiError';
import { User } from '../auth/user.model';
import { env } from '../../config/env';

export interface LicenseData {
  userCount: number;
  maxUsers: number | null;
  plan?: string;
}

export async function getLicense(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  if (req.user.role !== 'admin' && !req.user.permissions?.includes('license:view')) {
    throw new ApiError(403, 'Access denied');
  }

  const userCount = await User.countDocuments();
  res.status(200).json({
    success: true,
    data: {
      userCount,
      maxUsers: env.maxUsers,
      plan: env.maxUsers ? 'licensed' : undefined,
    } satisfies LicenseData,
  });
}

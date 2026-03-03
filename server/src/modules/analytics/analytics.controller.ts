import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { ApiError } from '../../utils/ApiError';
import * as analyticsService from './analytics.service';

export async function getUsage(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  if (req.user.role !== 'admin' && !req.user.permissions?.includes('analytics:view')) {
    throw new ApiError(403, 'Access denied');
  }

  const fromStr = req.query.from as string | undefined;
  const toStr = req.query.to as string | undefined;
  const now = new Date();
  const from = fromStr ? new Date(fromStr) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const to = toStr ? new Date(toStr) : now;

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, 'Invalid date range');
  }

  const data = await analyticsService.getUsageStats(from, to);
  res.status(200).json({ success: true, data });
}

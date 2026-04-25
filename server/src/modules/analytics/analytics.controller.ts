import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { ApiError } from '../../utils/ApiError';
import { userHasPermission } from '../../shared/constants/legacyPermissionMap';
import { TASK_FLOW_PERMISSIONS } from '../../shared/constants/permissions';
import * as analyticsService from './analytics.service';

export async function getUsage(req: Request & { user?: AuthPayload; activeOrganizationId?: string }, res: Response): Promise<void> {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  if (
    req.user.role !== 'admin' &&
    !userHasPermission(req.user.permissions ?? [], TASK_FLOW_PERMISSIONS.TASKFLOW.ANALYTICS.VIEW)
  ) {
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

  const data = await analyticsService.getUsageStats(from, to, req.activeOrganizationId);
  res.status(200).json({ success: true, data });
}

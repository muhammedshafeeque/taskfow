import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import * as auditLogService from './auditLog.service';

export async function listAuditLogs(req: Request & { user?: AuthPayload; activeOrganizationId?: string }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admin only.');
  }

  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const user = req.query.user as string | undefined;
  const action = req.query.action as string | undefined;
  const resourceType = req.query.resourceType as string | undefined;
  const projectId = req.query.projectId as string | undefined;

  const result = await auditLogService.findAll(
    { user, action, resourceType, projectId },
    { page, limit },
    req.activeOrganizationId
  );
  res.status(200).json({ success: true, data: result });
}

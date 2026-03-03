import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as dashboardService from './dashboard.service';
import { ApiError } from '../../utils/ApiError';

export async function getDashboardStats(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await dashboardService.getStatsForUser(userId);
  res.status(200).json({ success: true, data });
}

export async function getWorkloadStats(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const projectId = req.query.projectId as string | undefined;
  const data = await dashboardService.getWorkloadStats(userId, projectId);
  res.status(200).json({ success: true, data });
}

export async function getExecutiveStats(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Admin only');
  }
  const data = await dashboardService.getExecutiveStats();
  res.status(200).json({ success: true, data });
}

export async function getPortfolioStats(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await dashboardService.getPortfolioStats(userId);
  res.status(200).json({ success: true, data });
}

export async function getDefectMetrics(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const projectId = req.query.projectId as string | undefined;
  const data = await dashboardService.getDefectMetrics(userId, projectId);
  res.status(200).json({ success: true, data });
}

export async function getCostUsage(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const projectId = req.query.projectId as string | undefined;
  const fromStr = req.query.from as string | undefined;
  const toStr = req.query.to as string | undefined;
  const now = new Date();
  const from = fromStr ? new Date(fromStr) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const to = toStr ? new Date(toStr) : now;
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, 'Invalid date range');
  }
  const data = await dashboardService.getCostUsageReport(userId, projectId, from, to);
  res.status(200).json({ success: true, data });
}

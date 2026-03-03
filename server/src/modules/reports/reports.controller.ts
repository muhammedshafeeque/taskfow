import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { ApiError } from '../../utils/ApiError';
import * as reportsService from './reports.service';

export async function listReports(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await reportsService.listReports(userId);
  res.json({ success: true, data });
}

export async function createReport(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const body = req.body as { name?: string; project?: string; type?: string; config?: reportsService.ReportConfig };
  const data = await reportsService.createReport(userId, {
    name: body.name ?? '',
    project: body.project,
    type: (body.type ?? 'issues_by_status') as reportsService.ReportType,
    config: body.config,
  });
  res.status(201).json({ success: true, data });
}

export async function updateReport(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const reportId = req.params.id as string;
  const body = req.body as { name?: string; project?: string | null; type?: string; config?: reportsService.ReportConfig };
  const data = await reportsService.updateReport(reportId, userId, {
    name: body.name,
    project: body.project,
    type: body.type as reportsService.ReportType | undefined,
    config: body.config,
  });
  if (!data) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }
  res.json({ success: true, data });
}

export async function deleteReport(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const reportId = req.params.id as string;
  const deleted = await reportsService.deleteReport(reportId, userId);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }
  res.json({ success: true });
}

export async function executeReport(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const reportId = req.params.id as string;
  const data = await reportsService.executeReport(reportId, userId);
  res.json({ success: true, data });
}

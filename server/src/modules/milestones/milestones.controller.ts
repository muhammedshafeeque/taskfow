import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import * as milestonesService from './milestones.service';

export async function listMilestones(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  const projectId = req.params.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await milestonesService.listByProject(projectId, userId);
  res.status(200).json({ success: true, data });
}

export async function createMilestone(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  const projectId = req.params.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await milestonesService.create(projectId, req.body, userId);
  res.status(201).json({ success: true, data });
}

export async function updateMilestone(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  const projectId = req.params.id;
  const milestoneId = req.params.milestoneId;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await milestonesService.update(milestoneId, projectId, req.body, userId);
  if (!data) throw new ApiError(404, 'Milestone not found');
  res.status(200).json({ success: true, data });
}

export async function deleteMilestone(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  const projectId = req.params.id;
  const milestoneId = req.params.milestoneId;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const deleted = await milestonesService.remove(milestoneId, projectId, userId);
  if (!deleted) throw new ApiError(404, 'Milestone not found');
  res.status(200).json({ success: true, data: { message: 'Milestone deleted' } });
}

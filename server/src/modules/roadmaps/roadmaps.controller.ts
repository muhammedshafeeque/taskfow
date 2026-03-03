import { Request, Response } from 'express';
import * as roadmapsService from './roadmaps.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import type { AuthPayload } from '../../types/express';

export const listRoadmaps = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const projectId = req.params.id;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const list = await roadmapsService.listByProject(projectId, userId);
  res.status(200).json({ success: true, data: list });
});

export const createRoadmap = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const projectId = req.params.id;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const roadmap = await roadmapsService.create(projectId, req.body, userId);
  res.status(201).json({ success: true, data: roadmap });
});

export const updateRoadmap = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id: projectId, roadmapId } = req.params;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const roadmap = await roadmapsService.update(roadmapId, projectId, req.body, userId);
  if (!roadmap) {
    res.status(404).json({ success: false, message: 'Roadmap not found' });
    return;
  }
  res.status(200).json({ success: true, data: roadmap });
});

export const deleteRoadmap = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id: projectId, roadmapId } = req.params;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const removed = await roadmapsService.remove(roadmapId, projectId, userId);
  if (!removed) {
    res.status(404).json({ success: false, message: 'Roadmap not found' });
    return;
  }
  res.status(200).json({ success: true, data: { message: 'Deleted' } });
});

export const getRoadmapMilestones = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id: projectId, roadmapId } = req.params;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const milestones = await roadmapsService.getMilestonesForRoadmap(roadmapId, projectId, userId);
  res.status(200).json({ success: true, data: milestones });
});

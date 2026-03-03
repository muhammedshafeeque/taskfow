import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import {
  createSavedFilterSchema,
  updateSavedFilterSchema,
  deleteSavedFilterSchema,
  listSavedFiltersQuerySchema,
} from './savedFilter.validation';
import * as savedFiltersService from './savedFilters.service';
import { ApiError } from '../../utils/ApiError';

export async function listSavedFilters(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { project } = req.query as { project: string };
  const data = await savedFiltersService.listByProject(userId, project);
  res.status(200).json({ success: true, data });
}

export async function createSavedFilter(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const data = await savedFiltersService.create(userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function updateSavedFilter(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { id } = req.params;
  const data = await savedFiltersService.update(id, userId, req.body);
  if (!data) throw new ApiError(404, 'Saved filter not found');
  res.status(200).json({ success: true, data });
}

export async function deleteSavedFilter(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { id } = req.params;
  const deleted = await savedFiltersService.remove(id, userId);
  if (!deleted) throw new ApiError(404, 'Saved filter not found');
  res.status(200).json({ success: true, data: { message: 'Deleted' } });
}

export const listSavedFiltersHandler = [
  validate(listSavedFiltersQuerySchema.shape.query, 'query'),
  asyncHandler(listSavedFilters),
];

export const createSavedFilterHandler = [
  validate(createSavedFilterSchema.shape.body, 'body'),
  asyncHandler(createSavedFilter),
];

export const updateSavedFilterHandler = [
  validate(updateSavedFilterSchema.shape.params, 'params'),
  validate(updateSavedFilterSchema.shape.body, 'body'),
  asyncHandler(updateSavedFilter),
];

export const deleteSavedFilterHandler = [
  validate(deleteSavedFilterSchema.shape.params, 'params'),
  asyncHandler(deleteSavedFilter),
];

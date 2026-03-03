import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
} from './boards.validation';
import * as boardsService from './boards.service';
import { ApiError } from '../../utils/ApiError';

export async function createBoard(req: Request, res: Response): Promise<void> {
  const board = await boardsService.create(req.body);
  res.status(201).json({ success: true, data: board });
}

export async function getBoards(req: Request, res: Response): Promise<void> {
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 20, 100);
  const projectId = req.query.project as string | undefined;
  const result = await boardsService.findAll(projectId, { page, limit });
  res.status(200).json({ success: true, data: result });
}

export async function getBoardById(req: Request, res: Response): Promise<void> {
  const board = await boardsService.findById(req.params.id);
  if (!board) throw new ApiError(404, 'Board not found');
  res.status(200).json({ success: true, data: board });
}

export async function updateBoard(req: Request, res: Response): Promise<void> {
  const board = await boardsService.update(req.params.id, req.body);
  if (!board) throw new ApiError(404, 'Board not found');
  res.status(200).json({ success: true, data: board });
}

export async function deleteBoard(req: Request, res: Response): Promise<void> {
  const deleted = await boardsService.remove(req.params.id);
  if (!deleted) throw new ApiError(404, 'Board not found');
  res.status(200).json({ success: true, data: { message: 'Board deleted' } });
}

export const createBoardHandler = [
  validate(createBoardSchema.shape.body, 'body'),
  asyncHandler(createBoard),
];

export const updateBoardHandler = [
  validate(updateBoardSchema.shape.params, 'params'),
  validate(updateBoardSchema.shape.body, 'body'),
  asyncHandler(updateBoard),
];

export const boardIdParamHandler = [
  validate(boardIdParamSchema.shape.params, 'params'),
];

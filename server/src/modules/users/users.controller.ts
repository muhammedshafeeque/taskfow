import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { usersValidation } from './users.validation';
import * as usersService from './users.service';
import { ApiError } from '../../utils/ApiError';

export async function getUsers(req: Request, res: Response): Promise<void> {
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 20, 100);
  const result = await usersService.findAll({ page, limit });
  res.status(200).json({ success: true, data: result });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await usersService.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: user });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const permissions = req.user?.permissions ?? [];
  const hasEditPermission = permissions.includes('users:edit');
  const user = await usersService.update(req.params.id, req.body, userId, hasEditPermission);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: user });
}

export async function inviteUser(req: Request, res: Response): Promise<void> {
  const data = await usersService.invite(req.body);
  res.status(201).json({ success: true, data });
}

export const updateUserHandler = [
  validate(usersValidation.updateUser.shape.params, 'params'),
  validate(usersValidation.updateUser.shape.body, 'body'),
  asyncHandler(updateUser),
];

export const inviteUserHandler = [
  validate(usersValidation.inviteUser.shape.body, 'body'),
  asyncHandler(inviteUser),
];

export const userIdParamHandler = [
  validate(usersValidation.userIdParam.shape.params, 'params'),
];

import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { designationsValidation } from './designations.validation';
import * as designationsService from './designations.service';
import { ApiError } from '../../utils/ApiError';

export async function getDesignations(_req: Request, res: Response): Promise<void> {
  const data = await designationsService.findAll();
  res.status(200).json({ success: true, data });
}

export async function getDesignationById(req: Request, res: Response): Promise<void> {
  const designation = await designationsService.findById(req.params.id);
  if (!designation) throw new ApiError(404, 'Designation not found');
  res.status(200).json({ success: true, data: designation });
}

export async function createDesignation(req: Request, res: Response): Promise<void> {
  const data = await designationsService.create(req.body);
  res.status(201).json({ success: true, data });
}

export async function updateDesignation(req: Request, res: Response): Promise<void> {
  const designation = await designationsService.update(req.params.id, req.body);
  if (!designation) throw new ApiError(404, 'Designation not found');
  res.status(200).json({ success: true, data: designation });
}

export async function deleteDesignation(req: Request, res: Response): Promise<void> {
  const deleted = await designationsService.remove(req.params.id);
  if (!deleted) throw new ApiError(404, 'Designation not found');
  res.status(200).json({ success: true, data: { deleted: true } });
}

export const getDesignationsHandler = asyncHandler(getDesignations);
export const getDesignationByIdHandler = asyncHandler(getDesignationById);
export const createDesignationHandler = [
  validate(designationsValidation.createDesignation.shape.body, 'body'),
  asyncHandler(createDesignation),
];
export const updateDesignationHandler = [
  validate(designationsValidation.updateDesignation.shape.params, 'params'),
  validate(designationsValidation.updateDesignation.shape.body, 'body'),
  asyncHandler(updateDesignation),
];
export const deleteDesignationHandler = [
  validate(designationsValidation.designationIdParam.shape.params, 'params'),
  asyncHandler(deleteDesignation),
];
export const getDesignationByIdParamHandler = [validate(designationsValidation.designationIdParam.shape.params, 'params')];

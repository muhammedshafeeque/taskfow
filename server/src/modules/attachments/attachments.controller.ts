import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import {
  createAttachmentSchema,
  deleteAttachmentParamSchema,
  issueIdParamSchema,
} from './attachments.validation';
import * as attachmentsService from './attachments.service';
import { ApiError } from '../../utils/ApiError';

export async function getAttachments(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const list = await attachmentsService.findByIssue(req.params.issueId, userId);
  res.status(200).json({ success: true, data: list });
}

export async function addAttachment(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const { url, originalName, mimeType, size } = req.body;
  const doc = await attachmentsService.create(req.params.issueId, userId, {
    url,
    originalName,
    mimeType,
    size,
  });
  res.status(201).json({ success: true, data: doc });
}

export async function deleteAttachment(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const deleted = await attachmentsService.remove(
    req.params.id,
    req.params.issueId,
    userId
  );
  if (!deleted) throw new ApiError(404, 'Attachment not found');
  res.status(200).json({ success: true, data: { message: 'Attachment deleted' } });
}

export const createAttachmentHandler = [
  validate(createAttachmentSchema.shape.params, 'params'),
  validate(createAttachmentSchema.shape.body, 'body'),
  asyncHandler(addAttachment),
];

export const deleteAttachmentHandler = [
  validate(deleteAttachmentParamSchema.shape.params, 'params'),
  asyncHandler(deleteAttachment),
];

export const issueIdParamHandler = [
  validate(issueIdParamSchema.shape.params, 'params'),
];

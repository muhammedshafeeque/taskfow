import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { invitationsValidation } from './invitations.validation';
import * as projectInvitationsService from '../projects/projectInvitations.service';
import { ApiError } from '../../utils/ApiError';

export async function acceptInvitation(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const invitationId = req.params.id;
  const result = await projectInvitationsService.acceptInvitation(invitationId, userId);
  res.status(200).json({ success: true, data: result });
}

export async function declineInvitation(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const invitationId = req.params.id;
  await projectInvitationsService.declineInvitation(invitationId, userId);
  res.status(200).json({ success: true, data: { declined: true } });
}

export const acceptInvitationHandler = [
  validate(invitationsValidation.invitationIdParam.shape.params, 'params'),
  asyncHandler(acceptInvitation),
];

export const declineInvitationHandler = [
  validate(invitationsValidation.invitationIdParam.shape.params, 'params'),
  asyncHandler(declineInvitation),
];

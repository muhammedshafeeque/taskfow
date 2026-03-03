import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as inboxService from './inbox.service';
import { ApiError } from '../../utils/ApiError';

export async function getInbox(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 50, 100);
  const result = await inboxService.listForUser(userId, page, limit);
  res.status(200).json({ success: true, data: result });
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const msg = await inboxService.markRead(req.params.id, userId);
  if (!msg) throw new ApiError(404, 'Message not found');
  res.status(200).json({ success: true, data: msg });
}

export const getInboxHandler = asyncHandler(getInbox);
export const markAsReadHandler = asyncHandler(markAsRead);

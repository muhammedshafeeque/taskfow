import { Request, Response } from 'express';
import type { AuthPayload } from '../../types/express';
import { ApiError } from '../../utils/ApiError';
import * as traceabilityService from './traceability.service';

export async function getTraceability(req: Request & { user?: AuthPayload }, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  const projectId = req.params.id;
  const data = await traceabilityService.getTraceability(projectId, userId);
  res.status(200).json({ success: true, data });
}

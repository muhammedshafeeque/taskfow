import { Request, Response, NextFunction } from 'express';
import * as testCasesService from './testCases.service';
import { ApiError } from '../../utils/ApiError';
import type { AuthPayload } from '../../types/express';

export async function listTestCases(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const projectId = req.params.id;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const list = await testCasesService.listByProject(projectId, userId);
  res.status(200).json({ success: true, data: list });
}

export async function createTestCase(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const projectId = req.params.id;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const doc = await testCasesService.create(projectId, req.body, userId);
  res.status(201).json({ success: true, data: doc });
}

export async function updateTestCase(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const { id: projectId, testCaseId } = req.params;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const doc = await testCasesService.update(testCaseId, projectId, req.body, userId);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Test case not found' });
    return;
  }
  res.status(200).json({ success: true, data: doc });
}

export async function deleteTestCase(req: Request, res: Response, _next: NextFunction): Promise<void> {
  const { id: projectId, testCaseId } = req.params;
  const userId = (req as Request & { user?: AuthPayload }).user?.id;
  if (!userId) throw new ApiError(401, 'Authentication required');
  const removed = await testCasesService.remove(testCaseId, projectId, userId);
  if (!removed) {
    res.status(404).json({ success: false, message: 'Test case not found' });
    return;
  }
  res.status(200).json({ success: true, data: { message: 'Deleted' } });
}

import { Request, Response } from 'express';
import * as testPlansService from './testPlans.service';

export async function listTestPlans(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const data = await testPlansService.listTestPlans(projectId, userId);
  res.json({ success: true, data });
}

export async function createTestPlan(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const body = req.body as { name?: string; description?: string; testCaseIds?: string[] };
  const data = await testPlansService.createTestPlan(
    projectId,
    {
      name: body.name ?? '',
      description: body.description,
      testCaseIds: body.testCaseIds,
    },
    userId
  );
  res.status(201).json({ success: true, data });
}

export async function updateTestPlan(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const body = req.body as { name?: string; description?: string; testCaseIds?: string[] };
  const data = await testPlansService.updateTestPlan(projectId, planId, body, userId);
  if (!data) {
    res.status(404).json({ success: false, message: 'Test plan not found' });
    return;
  }
  res.json({ success: true, data });
}

export async function deleteTestPlan(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const deleted = await testPlansService.deleteTestPlan(projectId, planId, userId);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Test plan not found' });
    return;
  }
  res.json({ success: true });
}

export async function listTestCycles(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const data = await testPlansService.listTestCycles(projectId, planId, userId);
  res.json({ success: true, data });
}

export async function createTestCycle(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const body = req.body as { name?: string; startDate?: string; endDate?: string; status?: string };
  const data = await testPlansService.createTestCycle(
    projectId,
    planId,
    {
      name: body.name ?? '',
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      status: body.status as testPlansService.TestCycleStatus | undefined,
    },
    userId
  );
  res.status(201).json({ success: true, data });
}

export async function updateTestCycle(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const cycleId = req.params.cycleId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const body = req.body as { name?: string; startDate?: string; endDate?: string; status?: string };
  const data = await testPlansService.updateTestCycle(
    projectId,
    planId,
    cycleId,
    {
      name: body.name,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      status: body.status as testPlansService.TestCycleStatus | undefined,
    },
    userId
  );
  if (!data) {
    res.status(404).json({ success: false, message: 'Test cycle not found' });
    return;
  }
  res.json({ success: true, data });
}

export async function deleteTestCycle(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const cycleId = req.params.cycleId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const deleted = await testPlansService.deleteTestCycle(projectId, planId, cycleId, userId);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Test cycle not found' });
    return;
  }
  res.json({ success: true });
}

export async function getCycleRuns(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const cycleId = req.params.cycleId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const data = await testPlansService.getCycleRuns(projectId, planId, cycleId, userId);
  res.json({ success: true, data });
}

export async function updateRunStatus(req: Request, res: Response): Promise<void> {
  const projectId = req.params.id as string;
  const planId = req.params.planId as string;
  const cycleId = req.params.cycleId as string;
  const testCaseId = req.params.testCaseId as string;
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const body = req.body as { status?: string; result?: string; assignee?: string };
  const data = await testPlansService.updateRunStatus(
    projectId,
    planId,
    cycleId,
    testCaseId,
    {
      status: (body.status ?? 'pending') as testPlansService.TestRunStatus,
      result: body.result,
      assignee: body.assignee,
    },
    userId
  );
  res.json({ success: true, data });
}

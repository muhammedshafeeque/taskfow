import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/requireProjectPermission';
import { asyncHandler } from '../../utils/asyncHandler';
import * as testPlansController from './testPlans.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', requireProjectPermission('testManagement:view'), asyncHandler(testPlansController.listTestPlans as Parameters<typeof asyncHandler>[0]));
router.post('/', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.createTestPlan as Parameters<typeof asyncHandler>[0]));
router.patch('/:planId', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.updateTestPlan as Parameters<typeof asyncHandler>[0]));
router.delete('/:planId', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.deleteTestPlan as Parameters<typeof asyncHandler>[0]));
router.get('/:planId/cycles', requireProjectPermission('testManagement:view'), asyncHandler(testPlansController.listTestCycles as Parameters<typeof asyncHandler>[0]));
router.post('/:planId/cycles', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.createTestCycle as Parameters<typeof asyncHandler>[0]));
router.patch('/:planId/cycles/:cycleId', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.updateTestCycle as Parameters<typeof asyncHandler>[0]));
router.delete('/:planId/cycles/:cycleId', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.deleteTestCycle as Parameters<typeof asyncHandler>[0]));
router.get('/:planId/cycles/:cycleId/runs', requireProjectPermission('testManagement:view'), asyncHandler(testPlansController.getCycleRuns as Parameters<typeof asyncHandler>[0]));
router.patch('/:planId/cycles/:cycleId/runs/:testCaseId', requireProjectPermission('testManagement:edit'), asyncHandler(testPlansController.updateRunStatus as Parameters<typeof asyncHandler>[0]));

export const testPlansRoutes = router;

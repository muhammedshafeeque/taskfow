import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/requireProjectPermission';
import * as testCasesController from './testCases.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/', requireProjectPermission('testManagement:view'), asyncHandler(testCasesController.listTestCases as Parameters<typeof asyncHandler>[0]));
router.post('/', requireProjectPermission('testManagement:edit'), asyncHandler(testCasesController.createTestCase as Parameters<typeof asyncHandler>[0]));
router.patch('/:testCaseId', requireProjectPermission('testManagement:edit'), asyncHandler(testCasesController.updateTestCase as Parameters<typeof asyncHandler>[0]));
router.delete('/:testCaseId', requireProjectPermission('testManagement:edit'), asyncHandler(testCasesController.deleteTestCase as Parameters<typeof asyncHandler>[0]));

export const testCasesRoutes = router;

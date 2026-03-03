import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import { asyncHandler } from '../../utils/asyncHandler';
import * as reportsController from './reports.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('reports:view'), asyncHandler(reportsController.listReports as Parameters<typeof asyncHandler>[0]));
router.post('/', requirePermission('reports:create'), asyncHandler(reportsController.createReport as Parameters<typeof asyncHandler>[0]));
router.patch('/:id', requirePermission('reports:create'), asyncHandler(reportsController.updateReport as Parameters<typeof asyncHandler>[0]));
router.delete('/:id', requirePermission('reports:create'), asyncHandler(reportsController.deleteReport as Parameters<typeof asyncHandler>[0]));
router.post('/:id/execute', requirePermission('reports:view'), asyncHandler(reportsController.executeReport as Parameters<typeof asyncHandler>[0]));

export const reportsRoutes = router;

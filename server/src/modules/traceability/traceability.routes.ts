import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/requireProjectPermission';
import { asyncHandler } from '../../utils/asyncHandler';
import * as traceabilityController from './traceability.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/', requireProjectPermission('testManagement:view'), asyncHandler(traceabilityController.getTraceability as Parameters<typeof asyncHandler>[0]));

export const traceabilityRoutes = router;

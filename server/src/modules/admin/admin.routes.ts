import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import { asyncHandler } from '../../utils/asyncHandler';
import * as adminController from './admin.controller';

const router = Router();

router.use(authMiddleware);
router.use(requirePermission('license:view'));
router.get('/license', asyncHandler(adminController.getLicense as Parameters<typeof asyncHandler>[0]));

export const adminRoutes = router;

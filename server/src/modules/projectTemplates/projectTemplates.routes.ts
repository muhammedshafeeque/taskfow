import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as projectTemplatesController from './projectTemplates.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler(projectTemplatesController.listTemplates as Parameters<typeof asyncHandler>[0]));
router.get('/:id', asyncHandler(projectTemplatesController.getTemplate as Parameters<typeof asyncHandler>[0]));

export const projectTemplatesRoutes = router;

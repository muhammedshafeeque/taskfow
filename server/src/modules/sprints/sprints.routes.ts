import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createSprintHandler,
  getSprints,
  getSprintById,
  updateSprintHandler,
  startSprint,
  completeSprint,
  getCompletionPreview,
  deleteSprint,
  sprintIdParamHandler,
} from './sprints.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getSprints));
router.post('/', createSprintHandler);
router.get('/:id/completion-preview', ...sprintIdParamHandler, asyncHandler(getCompletionPreview));
router.get('/:id', ...sprintIdParamHandler, asyncHandler(getSprintById));
router.patch('/:id', updateSprintHandler);
router.post('/:id/start', ...sprintIdParamHandler, asyncHandler(startSprint));
router.post('/:id/complete', ...sprintIdParamHandler, asyncHandler(completeSprint));
router.delete('/:id', ...sprintIdParamHandler, asyncHandler(deleteSprint));

export const sprintsRoutes = router;

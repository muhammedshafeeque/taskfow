import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createWorkLogHandler,
  getWorkLogs,
  updateWorkLogHandler,
  deleteWorkLog,
  workLogIdParamHandler,
  issueIdParamHandler,
} from './workLogs.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/:issueId/work-logs', ...issueIdParamHandler, asyncHandler(getWorkLogs));
router.post('/:issueId/work-logs', ...issueIdParamHandler, ...createWorkLogHandler);
router.patch('/:issueId/work-logs/:id', ...workLogIdParamHandler, ...updateWorkLogHandler);
router.delete('/:issueId/work-logs/:id', ...workLogIdParamHandler, asyncHandler(deleteWorkLog));

export const workLogsRoutes = router;


import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  getAttachments,
  createAttachmentHandler,
  deleteAttachmentHandler,
  issueIdParamHandler,
} from './attachments.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/:issueId/attachments', ...issueIdParamHandler, asyncHandler(getAttachments));
router.post('/:issueId/attachments', createAttachmentHandler);
router.delete('/:issueId/attachments/:id', deleteAttachmentHandler);

export const attachmentsRoutes = router;

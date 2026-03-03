import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createCommentHandler,
  getComments,
  getCommentById,
  updateCommentHandler,
  deleteComment,
  commentIdParamHandler,
  issueIdOnlyParamHandler,
} from './comments.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/:issueId/comments', ...issueIdOnlyParamHandler, asyncHandler(getComments));
router.post('/:issueId/comments', createCommentHandler);
router.get('/:issueId/comments/:id', ...commentIdParamHandler, asyncHandler(getCommentById));
router.patch('/:issueId/comments/:id', updateCommentHandler);
router.delete('/:issueId/comments/:id', ...commentIdParamHandler, asyncHandler(deleteComment));

export const commentsRoutes = router;

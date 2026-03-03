import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  createBoardHandler,
  getBoards,
  getBoardById,
  updateBoardHandler,
  deleteBoard,
  boardIdParamHandler,
} from './boards.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getBoards));
router.post('/', createBoardHandler);
router.get('/:id', ...boardIdParamHandler, asyncHandler(getBoardById));
router.patch('/:id', updateBoardHandler);
router.delete('/:id', ...boardIdParamHandler, asyncHandler(deleteBoard));

export const boardsRoutes = router;

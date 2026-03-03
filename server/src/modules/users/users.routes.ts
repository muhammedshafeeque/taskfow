import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import {
  getUsers,
  getUserById,
  updateUserHandler,
  inviteUserHandler,
  userIdParamHandler,
} from './users.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('users:list'), asyncHandler(getUsers));
router.get('/:id', ...userIdParamHandler, asyncHandler(getUserById));
router.post('/invite', requirePermission('users:invite'), ...inviteUserHandler);
router.patch('/:id', requirePermission('users:edit'), updateUserHandler);

export const usersRoutes = router;

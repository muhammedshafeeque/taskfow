import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { getInboxHandler, markAsReadHandler } from './inbox.controller';

const router = Router();

router.use(authMiddleware);
// No requirePermission('inbox:read') — any authenticated user can read their own inbox
// (project invitations must be visible to invited users regardless of role permissions)
router.get('/', getInboxHandler);
router.patch('/:id/read', markAsReadHandler);

export const inboxRoutes = router;

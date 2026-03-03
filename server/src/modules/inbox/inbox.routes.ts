import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import { getInboxHandler, markAsReadHandler } from './inbox.controller';

const router = Router();

router.use(authMiddleware);
router.use(requirePermission('inbox:read'));

router.get('/', getInboxHandler);
router.patch('/:id/read', markAsReadHandler);

export const inboxRoutes = router;

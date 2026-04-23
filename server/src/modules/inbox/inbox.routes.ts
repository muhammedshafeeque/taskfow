import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import { asyncHandler } from '../../utils/asyncHandler';
import { TASK_FLOW_PERMISSIONS } from '../../shared/constants/permissions';
import { getInboxHandler, markAsReadHandler, getUnreadCountHandler } from './inbox.controller';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getUnreadCount,
  deleteNotification,
} from '../notifications/notifications.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission(TASK_FLOW_PERMISSIONS.INBOX.INBOX.LIST), getInboxHandler);
router.get('/unread-count', requirePermission(TASK_FLOW_PERMISSIONS.INBOX.INBOX.LIST), getUnreadCountHandler);
router.patch(
  '/:id/read',
  requirePermission(TASK_FLOW_PERMISSIONS.INBOX.INBOX.READ),
  markAsReadHandler
);

router.get(
  '/notifications',
  asyncHandler(listNotifications)
);
router.get(
  '/notifications/unread-count',
  asyncHandler(getUnreadCount)
);
router.patch(
  '/notifications/:id/read',
  asyncHandler(markNotificationRead)
);
router.patch(
  '/notifications/read-all',
  asyncHandler(markAllNotificationsRead)
);
router.delete(
  '/notifications/:id',
  asyncHandler(deleteNotification)
);

router.get('/mentions', requirePermission(TASK_FLOW_PERMISSIONS.INBOX.MENTION.LIST), (_req, res) => {
  res.status(200).json({ success: true, data: { data: [], total: 0, page: 1, limit: 30, totalPages: 1 } });
});

router.get('/activity', requirePermission(TASK_FLOW_PERMISSIONS.INBOX.ACTIVITY.LIST), (_req, res) => {
  res.status(200).json({ success: true, data: { data: [], total: 0, page: 1, limit: 30, totalPages: 1 } });
});

export const inboxRoutes = router;

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listAuditLogs } from './auditLog.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listAuditLogs));

export const auditLogsRoutes = router;

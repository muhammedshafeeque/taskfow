import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getDashboardStats, getWorkloadStats, getPortfolioStats, getExecutiveStats, getDefectMetrics, getCostUsage, getEstimatesStats, getProjectMetrics } from './dashboard.controller';

const router = Router();

router.use(authMiddleware);

router.get('/stats', asyncHandler(getDashboardStats));
router.get('/workload', asyncHandler(getWorkloadStats));
router.get('/portfolio', asyncHandler(getPortfolioStats));
router.get('/executive', asyncHandler(getExecutiveStats));
router.get('/defect-metrics', asyncHandler(getDefectMetrics));
router.get('/cost-usage', asyncHandler(getCostUsage));
router.get('/estimates', asyncHandler(getEstimatesStats));
router.get('/project-metrics', asyncHandler(getProjectMetrics));

export const dashboardRoutes = router;

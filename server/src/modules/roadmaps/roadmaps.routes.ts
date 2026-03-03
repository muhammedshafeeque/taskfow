import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/requireProjectPermission';
import * as roadmapsController from './roadmaps.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', requireProjectPermission('roadmaps:view'), roadmapsController.listRoadmaps);
router.post('/', requireProjectPermission('roadmaps:edit'), roadmapsController.createRoadmap);
router.get('/:roadmapId/milestones', requireProjectPermission('roadmaps:view'), roadmapsController.getRoadmapMilestones);
router.patch('/:roadmapId', requireProjectPermission('roadmaps:edit'), roadmapsController.updateRoadmap);
router.delete('/:roadmapId', requireProjectPermission('roadmaps:edit'), roadmapsController.deleteRoadmap);

export const roadmapsRoutes = router;

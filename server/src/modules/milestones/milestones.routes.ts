import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireProjectPermission } from '../../middleware/requireProjectPermission';
import { asyncHandler } from '../../utils/asyncHandler';
import { listMilestones, createMilestone, updateMilestone, deleteMilestone } from './milestones.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/', asyncHandler(listMilestones));
router.post('/', requireProjectPermission('project:edit'), asyncHandler(createMilestone));
router.patch('/:milestoneId', requireProjectPermission('project:edit'), asyncHandler(updateMilestone));
router.delete('/:milestoneId', requireProjectPermission('project:edit'), asyncHandler(deleteMilestone));

export const milestonesRoutes = router;

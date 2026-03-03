import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { acceptInvitationHandler, declineInvitationHandler } from './invitations.controller';

const router = Router();

router.use(authMiddleware);

router.post('/:id/accept', acceptInvitationHandler);
router.post('/:id/decline', declineInvitationHandler);

export const invitationsRoutes = router;

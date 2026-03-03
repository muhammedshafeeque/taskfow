import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import { subscribeHandler, unsubscribeHandler } from './pushSubscriptions.controller';
import { pushSubscriptionsValidation } from './pushSubscriptions.validation';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(pushSubscriptionsValidation.subscribeBody, 'body'), subscribeHandler);
router.delete('/', validate(pushSubscriptionsValidation.unsubscribeBody, 'body'), unsubscribeHandler);

export const pushSubscriptionsRoutes = router;

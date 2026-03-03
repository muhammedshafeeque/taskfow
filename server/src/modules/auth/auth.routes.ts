import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  updateProfileHandler,
} from './auth.controller';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.patch('/me', updateProfileHandler);
router.patch('/me/password', changePasswordHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

export const authRoutes = router;

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import * as authService from './auth.service';

export async function oauthSuccessHandler(req: Request, res: Response): Promise<void> {
  const user = req.user as
    | { _id?: { toString(): string }; id?: string; userType?: string }
    | undefined;
  const sub =
    user && '_id' in user && user._id
      ? user._id.toString()
      : user && 'id' in user && user.id
        ? user.id
        : undefined;
  if (!sub) {
    res.redirect(`${env.frontendUrl}/auth/error?reason=no_user`);
    return;
  }
  const ut =
    user && 'userType' in user && typeof user.userType === 'string' ? user.userType : 'taskflow';
  const token =
    ut === 'taskflow'
      ? await authService.issueTaskflowAccessTokenForOAuth(sub)
      : jwt.sign({ sub, userType: ut }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
  res.redirect(`${env.frontendUrl}/auth/oauth-callback?token=${encodeURIComponent(token)}`);
}

export function oauthFailureHandler(_req: Request, res: Response): void {
  res.redirect(`${env.frontendUrl}/auth/error?reason=oauth_failed`);
}

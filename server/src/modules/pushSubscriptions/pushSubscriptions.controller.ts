import { Request, Response, NextFunction } from 'express';
import { PushSubscription } from './pushSubscription.model';
import { ApiError } from '../../utils/ApiError';
import type { AuthPayload } from '../../types/express';

export async function subscribeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as AuthPayload;
    const { subscription } = req.body as { subscription: { endpoint: string; keys: { p256dh: string; auth: string } } };
    await PushSubscription.findOneAndUpdate(
      { user: user.id, endpoint: subscription.endpoint },
      {
        user: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function unsubscribeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as AuthPayload;
    const { endpoint } = req.body as { endpoint: string };
    const result = await PushSubscription.deleteOne({ user: user.id, endpoint });
    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Subscription not found');
    }
    res.status(200).json({ success: true });
  } catch (e) {
    next(e);
  }
}

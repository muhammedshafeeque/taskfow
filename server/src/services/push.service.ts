import webpush from 'web-push';
import { PushSubscription } from '../modules/pushSubscriptions/pushSubscription.model';
import { env } from '../config/env';

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  data?: Record<string, unknown>;
}

let vapidConfigured = false;

function ensureVapid(): void {
  if (vapidConfigured) return;
  if (env.vapidPublicKey && env.vapidPrivateKey) {
    webpush.setVapidDetails(
      'mailto:noreply@taskflow.local',
      env.vapidPublicKey,
      env.vapidPrivateKey
    );
    vapidConfigured = true;
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!env.vapidPublicKey || !env.vapidPrivateKey) return;
  ensureVapid();
  const subscriptions = await PushSubscription.find({ user: userId }).lean();
  const payloadStr = JSON.stringify(payload);
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        payloadStr
      );
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
      console.error('Push send failed:', err);
    }
  }
}

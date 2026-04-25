import { env } from '../../config/env';
import { sendPushToUser } from '../../services/push.service';
import { notifyPush } from '../../websocket';
import { sendCustomerEmail } from '../../services/email.service';
import {
  sendThirdPartyNotification,
  sendSmsNotification,
  sendWhatsappNotification,
  type ThirdPartyProvider,
} from '../../services/notifications/thirdPartyNotifier';
import type { NotificationEventKey } from '../../shared/constants/notificationCatalog';
import { createNotification } from './notifications.service';
import { shouldSend } from './notificationPreference.service';
import { User } from '../auth/user.model';

export type NotifyUserParams = {
  userId: string;
  eventKey: NotificationEventKey;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  /** When true, skips the email channel (e.g. a dedicated transactional email was already sent). */
  skipEmail?: boolean;
};

export async function notifyUser(params: NotifyUserParams): Promise<void> {
  const { userId, eventKey, title, body = '', link, metadata, skipEmail } = params;

  if (await shouldSend(userId, eventKey, 'in_app')) {
    await createNotification({
      userId,
      type: eventKey,
      title,
      body,
      link,
      metadata,
    });
  }

  if (await shouldSend(userId, eventKey, 'push')) {
    const payload = { title, body, url: link, data: { eventKey, ...(metadata ?? {}) } };
    sendPushToUser(userId, payload).catch((err) => console.error('Push failed:', err));
    notifyPush(userId, payload);
  }

  if (!skipEmail && (await shouldSend(userId, eventKey, 'email'))) {
    const user = await User.findById(userId).select('email').lean();
    const to = (user as { email?: string } | null)?.email;
    if (to) {
      const html = `<div><h3>${title}</h3><p>${body}</p>${link ? `<p><a href="${link}">Open</a></p>` : ''}</div>`;
      sendCustomerEmail(to, title, html).catch((err) => console.error('Email send failed:', err));
    }
  }

  if (await shouldSend(userId, eventKey, 'sms')) {
    const smsToFromMeta = typeof metadata?.smsTo === 'string' ? metadata.smsTo : '';
    const smsTo = smsToFromMeta || env.smsDefaultTo;
    if (smsTo) {
      sendSmsNotification(smsTo, `${title}${body ? ` - ${body}` : ''}${link ? ` ${link}` : ''}`).catch((err) =>
        console.error('SMS send failed:', err)
      );
    }
  }
  if (await shouldSend(userId, eventKey, 'whatsapp')) {
    const whatsappToFromMeta = typeof metadata?.whatsappTo === 'string' ? metadata.whatsappTo : '';
    const whatsappTo = whatsappToFromMeta || env.whatsappDefaultTo;
    if (whatsappTo) {
      sendWhatsappNotification(whatsappTo, `${title}${body ? ` - ${body}` : ''}${link ? ` ${link}` : ''}`).catch((err) =>
        console.error('WhatsApp send failed:', err)
      );
    }
  }

  const providerMethods: ThirdPartyProvider[] = ['slack', 'teams', 'telegram', 'discord'];
  for (const provider of providerMethods) {
    if (await shouldSend(userId, eventKey, provider)) {
      sendThirdPartyNotification(provider, {
        title,
        body,
        url: link,
        eventKey,
        userId,
        metadata,
      }).catch((err) => console.error(`Third-party send failed (${provider}):`, err));
    }
  }
}

export function mapLegacyNotificationType(type: string): NotificationEventKey {
  switch (type) {
    case 'issue_assigned':
      return 'task_assigned';
    case 'issue_unassigned':
      return 'task_unassigned';
    case 'issue_closed':
      return 'task_status_changed';
    case 'mention':
    case 'issue_mentioned':
      return 'task_mentioned';
    case 'watch_comment':
      return 'watch_comment';
    case 'watch_status':
      return 'watch_status';
    case 'watch_field':
      return 'watch_field';
    case 'invitation_accepted':
      return 'project_invitation_accepted';
    default:
      return 'system_alert';
  }
}

export function appUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.appUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

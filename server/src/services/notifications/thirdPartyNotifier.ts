import { env } from '../../config/env';

export type ThirdPartyPayload = {
  title: string;
  body?: string;
  url?: string;
  eventKey: string;
  userId: string;
  metadata?: Record<string, unknown>;
};

export type ThirdPartyProvider = 'slack' | 'teams' | 'telegram' | 'discord';

async function postJson(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function postJsonWithHeaders(url: string, body: unknown, headers: Record<string, string>): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function postForm(url: string, body: URLSearchParams): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function getTeamsGraphAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(env.teamsGraphTenantId)}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.teamsGraphClientId,
    client_secret: env.teamsGraphClientSecret,
    scope: 'https://graph.microsoft.com/.default',
  });
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function sendThirdPartyNotification(provider: ThirdPartyProvider, payload: ThirdPartyPayload): Promise<void> {
  if (provider === 'teams' && env.isTeamsEnabled && env.teamsWebhookUrl) {
    await postJson(env.teamsWebhookUrl, {
      title: payload.title,
      text: `${payload.body ?? ''}${payload.url ? `\n${payload.url}` : ''}`,
      eventKey: payload.eventKey,
    });
    return;
  }
  if (
    provider === 'teams' &&
    env.isTeamsGraphEnabled &&
    env.teamsGraphTenantId &&
    env.teamsGraphClientId &&
    env.teamsGraphClientSecret &&
    env.teamsGraphTeamId &&
    env.teamsGraphChannelId
  ) {
    const token = await getTeamsGraphAccessToken();
    await postJsonWithHeaders(
      `https://graph.microsoft.com/v1.0/teams/${encodeURIComponent(env.teamsGraphTeamId)}/channels/${encodeURIComponent(env.teamsGraphChannelId)}/messages`,
      {
        body: {
          contentType: 'html',
          content: `<b>${payload.title}</b><br/>${payload.body ?? ''}${payload.url ? `<br/><a href="${payload.url}">${payload.url}</a>` : ''}`,
        },
      },
      { Authorization: `Bearer ${token}` }
    );
    return;
  }

  if (provider === 'telegram' && env.isTelegramEnabled && env.telegramBotToken && env.telegramChatId) {
    const tgUrl = `https://api.telegram.org/bot${encodeURIComponent(env.telegramBotToken)}/sendMessage`;
    await postJson(tgUrl, {
      chat_id: env.telegramChatId,
      text: `${payload.title}\n${payload.body ?? ''}${payload.url ? `\n${payload.url}` : ''}`,
      disable_web_page_preview: false,
    });
    return;
  }

  if (provider === 'slack' && env.isSlackEnabled && env.slackBotToken && env.slackDefaultChannel) {
    await postJsonWithHeaders(
      'https://slack.com/api/chat.postMessage',
      {
        channel: env.slackDefaultChannel,
        text: `${payload.title}\n${payload.body ?? ''}${payload.url ? `\n${payload.url}` : ''}`,
      },
      { Authorization: `Bearer ${env.slackBotToken}` }
    );
    return;
  }
  if (provider === 'discord' && env.isDiscordEnabled && env.discordWebhookUrl) {
    await postJson(env.discordWebhookUrl, {
      content: `${payload.title}\n${payload.body ?? ''}${payload.url ? `\n${payload.url}` : ''}`.trim(),
    });
  }
}

export async function sendSmsNotification(to: string, message: string): Promise<void> {
  if (!env.isSmsEnabled) return;
  if (env.smsProvider === 'twilio' && env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.twilioAccountSid)}/Messages.json`;
    const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString('base64');
    const body = new URLSearchParams({ To: to, From: env.twilioFromNumber, Body: message });
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`SMS twilio failed HTTP ${res.status}`);
    return;
  }
  if (env.smsProvider === 'fast2sms' && env.fast2smsApiKey) {
    await postJsonWithHeaders(
      'https://www.fast2sms.com/dev/bulkV2',
      { route: env.fast2smsRoute || 'q', message, numbers: to },
      { authorization: env.fast2smsApiKey }
    );
    return;
  }
  if (env.smsProvider === 'whatstosms' && env.whatstosmsApiKey && env.whatstosmsSenderId) {
    const body = new URLSearchParams({
      apiKey: env.whatstosmsApiKey,
      sender: env.whatstosmsSenderId,
      numbers: to,
      message,
    });
    await postForm('https://www.whatstosms.com/api/v1/send', body);
  }
}

export async function sendWhatsappNotification(to: string, message: string): Promise<void> {
  if (!env.isWhatsappEnabled || !env.whatsappAccessToken || !env.whatsappPhoneNumberId) return;
  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(env.whatsappPhoneNumberId)}/messages`;
  await postJsonWithHeaders(
    url,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: true, body: message },
    },
    { Authorization: `Bearer ${env.whatsappAccessToken}` }
  );
}

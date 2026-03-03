import { z } from 'zod';

const keysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export const subscribeBodySchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: keysSchema,
    expirationTime: z.number().nullable().optional(),
  }),
});

export const unsubscribeBodySchema = z.object({
  endpoint: z.string().min(1),
});

export const pushSubscriptionsValidation = {
  subscribeBody: subscribeBodySchema,
  unsubscribeBody: unsubscribeBodySchema,
};

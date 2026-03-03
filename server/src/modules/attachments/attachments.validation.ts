import { z } from 'zod';

export const createAttachmentSchema = z.object({
  body: z.object({
    url: z.string().min(1).refine((v) => v.startsWith('/api/uploads/'), {
      message: 'URL must start with /api/uploads/',
    }),
    originalName: z.string().min(1),
    mimeType: z.string().min(1),
    size: z.number().int().nonnegative(),
  }),
  params: z.object({
    issueId: z.string().min(1),
  }),
});

export const deleteAttachmentParamSchema = z.object({
  params: z.object({
    issueId: z.string().min(1),
    id: z.string().min(1),
  }),
});

export const issueIdParamSchema = z.object({
  params: z.object({
    issueId: z.string().min(1),
  }),
});

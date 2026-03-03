import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
  params: z.object({
    issueId: z.string().min(1),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
  params: z.object({
    issueId: z.string().min(1),
    id: z.string().min(1),
  }),
});

export const commentIdParamSchema = z.object({
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

export type CreateCommentBody = z.infer<typeof createCommentSchema>['body']['body'];

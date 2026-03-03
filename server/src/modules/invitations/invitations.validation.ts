import { z } from 'zod';

const invitationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const invitationsValidation = {
  invitationIdParam: invitationIdParamSchema,
};

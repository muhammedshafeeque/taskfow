import { z } from 'zod';

export const createOrganizationBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const organizationIdParam = z.object({
  id: z.string().min(1),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationBody>;

export const inviteTfOrgMemberBody = z.object({
  email: z.string().email(),
  role: z.enum(['org_admin', 'org_member']).optional(),
});

export const updateTfOrgMemberBody = z.object({
  role: z.enum(['org_admin', 'org_member']),
});

export const updateOrganizationBody = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .strict()
  .refine((b) => b.name !== undefined || b.description !== undefined || b.status !== undefined, {
    message: 'At least one field is required',
  });

export type InviteTfOrgMemberInput = z.infer<typeof inviteTfOrgMemberBody>;
export type UpdateTfOrgMemberInput = z.infer<typeof updateTfOrgMemberBody>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationBody>;

import { z } from 'zod';

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    role: z.enum(['user', 'admin']).optional(),
    roleId: z.string().min(1).optional().nullable(),
    designationId: z.string().min(1).optional().nullable(),
    enabled: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const inviteUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
    designationId: z.string().min(1).optional().nullable(),
    roleId: z.string().min(1),
  }),
});

export const usersValidation = {
  userIdParam: userIdParamSchema,
  updateUser: updateUserSchema,
  inviteUser: inviteUserSchema,
};

export type UpdateUserBody = z.infer<typeof updateUserSchema>['body'];
export type InviteUserBody = z.infer<typeof inviteUserSchema>['body'];

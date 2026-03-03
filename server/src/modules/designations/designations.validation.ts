import { z } from 'zod';

const designationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

const createDesignationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    order: z.number().optional(),
  }),
});

const updateDesignationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    order: z.number().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const designationsValidation = {
  designationIdParam: designationIdParamSchema,
  createDesignation: createDesignationSchema,
  updateDesignation: updateDesignationSchema,
};

export type CreateDesignationBody = z.infer<typeof createDesignationSchema>['body'];
export type UpdateDesignationBody = z.infer<typeof updateDesignationSchema>['body'];

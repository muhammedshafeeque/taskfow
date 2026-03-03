import { z } from 'zod';

const filtersSchema = z.object({
  status: z.array(z.string()).default([]),
  assignee: z.array(z.string()).default([]),
  reporter: z.array(z.string()).default([]),
  type: z.array(z.string()).default([]),
  priority: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  storyPoints: z.array(z.string()).default([]),
  hasStoryPoints: z.boolean().optional(),
});

export const createSavedFilterSchema = z.object({
  body: z.object({
    project: z.string().min(1, 'Project is required'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    filters: filtersSchema,
    quickFilter: z.enum(['all', 'my', 'open']).default('all'),
    jql: z.string().optional(),
    viewMode: z.enum(['list', 'table', 'kanban']).optional(),
  }),
});

export const updateSavedFilterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Filter ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    filters: filtersSchema.optional(),
    quickFilter: z.enum(['all', 'my', 'open']).optional(),
    jql: z.string().optional().nullable(),
    viewMode: z.enum(['list', 'table', 'kanban']).optional().nullable(),
  }),
});

export const deleteSavedFilterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Filter ID is required'),
  }),
});

export const listSavedFiltersQuerySchema = z.object({
  query: z.object({
    project: z.string().min(1, 'Project is required'),
  }),
});

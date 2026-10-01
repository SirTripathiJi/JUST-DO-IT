import { z } from 'zod'

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}).nullable().optional()
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional()

export const taskInputSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().max(20_000).nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: dateString,
  dueTime: timeString,
  endTime: timeString,
  completed: z.boolean().default(false),
  category: z.enum(['academic', 'career', 'work', 'personal', 'health', 'finance', 'projects']).default('personal'),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  notes: z.string().max(20_000).nullable().optional(),
  recurring: z.enum(['none', 'daily', 'weekdays', 'weekly', 'monthly']).nullable().optional(),
  reminder: z.boolean().default(false),
  subtasks: z.array(z.object({ title: z.string().trim().min(1).max(240), completed: z.boolean().default(false) }).strict()).max(100).default([]),
}).strict()

export const taskPatchSchema = taskInputSchema.partial().extend({
  completed: z.boolean().optional(),
}).strict()

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
}).strict()

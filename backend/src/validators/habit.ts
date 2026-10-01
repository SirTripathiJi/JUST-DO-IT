import { z } from 'zod'

const days = z.array(z.number().int().min(0).max(6)).max(7).refine((values) => new Set(values).size === values.length)
const completionMap = z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.boolean()).optional()

export const habitInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  icon: z.string().max(80).nullable().optional(),
  description: z.string().max(10_000).nullable().optional(),
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'custom']).default('daily'),
  selectedDays: days.default([]),
  targetPerDay: z.number().int().min(1).max(100).default(1),
  targetUnit: z.string().max(40).nullable().optional(),
  category: z.enum(['wellness', 'mindset', 'productivity', 'fitness', 'learning', 'health']).default('wellness'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'anytime']).nullable().optional(),
  color: z.string().max(40).nullable().optional(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  completions: completionMap,
}).strict()

export const habitPatchSchema = habitInputSchema.omit({ completions: true }).partial().strict()

export const habitCompletionSchema = z.object({ completed: z.boolean() }).strict()
export const archivedSchema = z.object({ archived: z.boolean() }).strict()

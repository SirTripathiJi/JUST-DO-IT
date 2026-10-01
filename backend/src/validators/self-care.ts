import { z } from 'zod'

export const selfCareInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  category: z.enum(['skincare', 'haircare', 'hygiene', 'grooming', 'body', 'mental']),
  frequency: z.enum(['daily', 'alternate', 'weekly', 'custom']),
  selectedDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  timeOfDay: z.enum(['morning', 'evening', 'night', 'anytime']),
  description: z.string().max(10_000).optional(),
}).strict()
export const selfCarePatchSchema = selfCareInputSchema.partial().strict()
export const selfCareCompletionSchema = z.object({ completed: z.boolean() }).strict()

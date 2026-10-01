import { z } from 'zod'

export const hobbySessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().min(0).max(1440),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(10_000).optional(),
}).strict()
export const hobbyInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  icon: z.string().max(80).optional(),
  targetFrequency: z.string().trim().min(1).max(100),
  targetMinutesPerWeek: z.number().int().min(0).max(10_080),
  notes: z.string().max(10_000).optional(),
  sessions: z.array(hobbySessionSchema.extend({ id: z.string().optional() })).max(500).optional(),
}).strict()
export const hobbyPatchSchema = hobbyInputSchema.omit({ sessions: true }).partial().strict()

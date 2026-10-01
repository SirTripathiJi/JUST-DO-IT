import { z } from 'zod'

export const supplementInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  dosage: z.string().trim().min(1).max(80),
  unit: z.string().trim().min(1).max(40),
  timing: z.enum(['morning', 'noon', 'evening', 'bedtime', 'with-meal']),
  frequency: z.enum(['daily', 'specific-days', 'as-needed']).default('daily'),
  selectedDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  notes: z.string().max(10_000).optional(),
  reminder: z.boolean().default(false),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  category: z.enum(['vitamin', 'nootropic', 'mineral', 'protein', 'general', 'herbal']).optional(),
}).strict()

export const supplementPatchSchema = supplementInputSchema.partial().strict()
export const supplementCompletionSchema = z.object({ completed: z.boolean() }).strict()

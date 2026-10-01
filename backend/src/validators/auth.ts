import { z } from 'zod'
import { env } from '../config/env.js'

export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(env.PASSWORD_MIN_LENGTH).max(72).refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
    message: 'Password must be no longer than 72 UTF-8 bytes.',
  }),
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().max(160).optional(),
}).strict()

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(72).refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
}).strict()

import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().startsWith('postgres'),
  FRONTEND_ORIGINS: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().min(1).default('jid_session'),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  SESSION_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  PASSWORD_MIN_LENGTH: z.coerce.number().int().min(12).max(128).default(12),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(2).default(0),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${z.prettifyError(parsed.error)}`)
}

const isProduction = parsed.data.NODE_ENV === 'production'
if (isProduction && !parsed.data.FRONTEND_ORIGINS) {
  throw new Error('FRONTEND_ORIGINS must list the exact HTTPS frontend origin(s) in production.')
}

const frontendOrigins = (parsed.data.FRONTEND_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (frontendOrigins.length === 0) {
  throw new Error('FRONTEND_ORIGINS must contain at least one origin.')
}

for (const origin of frontendOrigins) {
  let parsedOrigin: URL
  try {
    parsedOrigin = new URL(origin)
  } catch {
    throw new Error(`FRONTEND_ORIGINS contains an invalid origin: ${origin}`)
  }
  if (parsedOrigin.origin !== origin || (isProduction && parsedOrigin.protocol !== 'https:')) {
    throw new Error(`FRONTEND_ORIGINS must contain exact${isProduction ? ' HTTPS' : ''} origins without paths: ${origin}`)
  }
}

export const env = {
  ...parsed.data,
  frontendOrigins,
  sessionCookieSameSite: parsed.data.SESSION_COOKIE_SAME_SITE === 'none'
    ? 'None'
    : parsed.data.SESSION_COOKIE_SAME_SITE === 'strict' ? 'Strict' : 'Lax',
  isProduction,
}

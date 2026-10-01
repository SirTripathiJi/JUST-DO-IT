import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { env } from '../config/env.js'
import { readSessionCookie } from '../middleware/authenticate.js'
import { authenticateUser, createSession, deleteSession, findUserForSession, registerUser } from '../services/auth-service.js'
import { loginSchema, registerSchema } from '../validators/auth.js'

export const authRouter = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again later.' } },
})

function setSessionCookie(res: Parameters<Parameters<typeof authRouter.post>[1]>[1], token: string, expiresAt: Date) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  const flags = [
    `${env.SESSION_COOKIE_NAME}=${token}`,
    'Path=/api',
    'HttpOnly',
    `SameSite=${env.sessionCookieSameSite}`,
    `Max-Age=${maxAge}`,
  ]
  if (env.isProduction) flags.push('Secure')
  res.setHeader('Set-Cookie', flags.join('; '))
}

function clearSessionCookie(res: Parameters<Parameters<typeof authRouter.post>[1]>[1]) {
  const flags = [`${env.SESSION_COOKIE_NAME}=`, 'Path=/api', 'HttpOnly', `SameSite=${env.sessionCookieSameSite}`, 'Max-Age=0']
  if (env.isProduction) flags.push('Secure')
  res.setHeader('Set-Cookie', flags.join('; '))
}

authRouter.post('/register', authLimiter, async (req, res) => {
  const input = registerSchema.parse(req.body)
  const user = await registerUser(input)
  const session = await createSession(user.id)
  setSessionCookie(res, session.token, session.expiresAt)
  res.status(201).json({ data: user })
})

authRouter.post('/login', authLimiter, async (req, res) => {
  const input = loginSchema.parse(req.body)
  const user = await authenticateUser(input.email, input.password)
  const session = await createSession(user.id)
  setSessionCookie(res, session.token, session.expiresAt)
  res.status(200).json({ data: user })
})

authRouter.get('/me', async (req, res) => {
  const token = readSessionCookie(req)
  const user = token ? await findUserForSession(token) : null
  if (!user) {
    clearSessionCookie(res)
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } })
    return
  }
  res.json({ data: user })
})

authRouter.post('/logout', async (req, res) => {
  const token = readSessionCookie(req)
  if (token) await deleteSession(token)
  clearSessionCookie(res)
  res.status(204).end()
})

export const idSchema = z.string().uuid()

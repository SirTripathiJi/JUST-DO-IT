import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env.js'
import { HttpError } from '../lib/http-error.js'
import { findUserForSession } from '../services/auth-service.js'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export function readSessionCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return null
  const name = `${env.SESSION_COOKIE_NAME}=`
  const pair = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(name))
  return pair ? pair.slice(name.length) : null
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = readSessionCookie(req)
  if (!token) return next(new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue.'))
  const user = await findUserForSession(token)
  if (!user) return next(new HttpError(401, 'SESSION_EXPIRED', 'Your session has expired. Sign in again.'))
  req.userId = user.id
  next()
}

export function requireUserId(req: Request): string {
  if (!req.userId) throw new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue.')
  return req.userId
}

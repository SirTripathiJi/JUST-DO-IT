import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { HttpError } from '../lib/http-error.js'
import { createSessionToken, hashSessionToken } from '../lib/session-token.js'
import { prisma } from '../lib/prisma.js'

const BCRYPT_ROUNDS = 12

export type PublicUser = {
  id: string
  email: string
  profile: {
    name: string
    title: string
    dailyFocus: string
    semester: string | null
    wakeTime: string | null
    sleepTime: string | null
    avatarInitials: string
    avatarColor: string | null
    waterTargetMl: number
    onboarded: boolean
    onboardingData: unknown
  } | null
}

export async function registerUser(input: { email: string; password: string; name: string; title?: string }) {
  const email = input.email.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  const initials = input.name.trim().split(/\s+/).map((word) => word[0]?.toUpperCase()).join('').slice(0, 2)
  try {
    return await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            name: input.name.trim(),
            title: input.title?.trim() ?? '',
            avatarInitials: initials || 'U',
          },
        },
      },
      select: { id: true, email: true, profile: true },
    })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HttpError(409, 'EMAIL_IN_USE', 'An account with this email already exists.')
    }
    throw error
  }
}

export async function authenticateUser(emailInput: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: emailInput.trim().toLowerCase() },
    select: { id: true, email: true, passwordHash: true, profile: true },
  })
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!user || !valid) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }
  return { id: user.id, email: user.email, profile: user.profile }
}

export async function createSession(userId: string) {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  await prisma.session.create({
    data: { userId, tokenHash: hashSessionToken(token), expiresAt },
  })
  return { token, expiresAt }
}

export async function findUserForSession(token: string): Promise<PublicUser | null> {
  if (!token || token.length > 128) return null
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: { expiresAt: true, user: { select: { id: true, email: true, profile: true } } },
  })
  if (!session) return null
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } })
    return null
  }
  return session.user
}

export async function deleteSession(token: string): Promise<void> {
  if (token && token.length <= 128) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } })
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}

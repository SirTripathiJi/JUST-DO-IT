import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'

export const profileRouter = Router()

const profilePatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().max(160).optional(),
  dailyFocus: z.string().max(500).optional(),
  semester: z.string().max(120).nullable().optional(),
  wakeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  sleepTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  avatarInitials: z.string().max(4).optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  waterTargetMl: z.number().int().min(250).max(10_000).optional(),
  onboarded: z.boolean().optional(),
  onboardingData: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict()

profileRouter.use(authenticate)

profileRouter.get('/', async (req, res) => {
  const userId = requireUserId(req)
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) throw new HttpError(404, 'PROFILE_NOT_FOUND', 'The profile was not found.')
  res.json({ data: profile })
})

profileRouter.patch('/', async (req, res) => {
  const userId = requireUserId(req)
  const input = profilePatchSchema.parse(req.body)
  const { onboardingData, ...scalarInput } = input
  const data = {
    ...scalarInput,
    ...(onboardingData === undefined ? {} : { onboardingData: onboardingData === null ? Prisma.DbNull : onboardingData as Prisma.InputJsonValue }),
  }
  const profile = await prisma.profile.update({ where: { userId }, data })
  res.json({ data: profile })
})

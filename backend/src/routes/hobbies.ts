import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'
import { hobbyInputSchema, hobbyPatchSchema, hobbySessionSchema } from '../validators/hobby.js'

export const hobbyRouter = Router()
const idSchema = z.string().uuid()
const includeSessions = { sessions: { orderBy: { date: 'desc' as const } } }
type HobbyWithSessions = Prisma.HobbyGetPayload<{ include: typeof includeSessions }>
function dateValue(date: string) { return new Date(`${date}T00:00:00.000Z`) }
function serializeHobby(hobby: HobbyWithSessions) {
  return {
    id: hobby.id,
    name: hobby.name,
    category: hobby.category,
    icon: hobby.icon ?? undefined,
    targetFrequency: hobby.targetFrequency,
    targetMinutesPerWeek: hobby.targetMinutesPerWeek,
    notes: hobby.notes ?? undefined,
    sessions: hobby.sessions.map((session) => ({
      id: session.id,
      date: session.date.toISOString().slice(0, 10),
      durationMinutes: session.durationMinutes,
      rating: session.rating,
      notes: session.notes ?? undefined,
    })),
    currentStreak: hobby.sessions.length,
    createdAt: hobby.createdAt.toISOString(),
  }
}
function creationData(input: z.infer<typeof hobbyInputSchema>, userId: string) {
  const { sessions, ...hobby } = input
  return {
    ...hobby,
    userId,
    icon: hobby.icon ?? null,
    notes: hobby.notes ?? null,
    ...(sessions?.length ? { sessions: { create: sessions.map(({ date, id: _id, ...session }) => ({ ...session, date: dateValue(date) })) } } : {}),
  }
}

hobbyRouter.use(authenticate)
hobbyRouter.get('/', async (req, res) => {
  const userId = requireUserId(req)
  const hobbies = await prisma.hobby.findMany({ where: { userId }, include: includeSessions, orderBy: { createdAt: 'desc' } })
  res.json({ data: hobbies.map(serializeHobby) })
})
hobbyRouter.put('/', async (req, res) => {
  const userId = requireUserId(req)
  const inputs = z.array(hobbyInputSchema).max(250).parse(req.body)
  const hobbies = await prisma.$transaction(async (tx) => {
    if (await tx.hobby.count({ where: { userId } })) throw new HttpError(409, 'HOBBIES_ALREADY_INITIALIZED', 'Hobbies have already been initialized for this account.')
    for (const input of inputs) await tx.hobby.create({ data: creationData(input, userId) })
    return tx.hobby.findMany({ where: { userId }, include: includeSessions, orderBy: { createdAt: 'desc' } })
  })
  res.json({ data: hobbies.map(serializeHobby) })
})
hobbyRouter.post('/', async (req, res) => {
  const userId = requireUserId(req)
  const input = hobbyInputSchema.parse(req.body)
  const hobby = await prisma.hobby.create({ data: creationData(input, userId), include: includeSessions })
  res.status(201).json({ data: serializeHobby(hobby) })
})
hobbyRouter.patch('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const input = hobbyPatchSchema.parse(req.body)
  const result = await prisma.hobby.updateMany({ where: { id, userId }, data: input })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Hobby was not found.')
  const hobby = await prisma.hobby.findFirstOrThrow({ where: { id, userId }, include: includeSessions })
  res.json({ data: serializeHobby(hobby) })
})
hobbyRouter.post('/:id/sessions', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const input = hobbySessionSchema.parse(req.body)
  const hobby = await prisma.hobby.findFirst({ where: { id, userId } })
  if (!hobby) throw new HttpError(404, 'NOT_FOUND', 'Hobby was not found.')
  await prisma.hobbySession.create({ data: { hobbyId: id, ...input, date: dateValue(input.date), notes: input.notes ?? null } })
  const updated = await prisma.hobby.findFirstOrThrow({ where: { id, userId }, include: includeSessions })
  res.status(201).json({ data: serializeHobby(updated) })
})
hobbyRouter.delete('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const result = await prisma.hobby.deleteMany({ where: { id, userId } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Hobby was not found.')
  res.status(204).end()
})

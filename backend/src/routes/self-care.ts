import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'
import { selfCareCompletionSchema, selfCareInputSchema, selfCarePatchSchema } from '../validators/self-care.js'

export const selfCareRouter = Router()
const idSchema = z.string().uuid()
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
})
const includeCompletions = { completions: { orderBy: { completedOn: 'asc' as const } } }
type RoutineWithCompletions = Prisma.SelfCareRoutineGetPayload<{ include: typeof includeCompletions }>
function dateValue(date: string) { return new Date(`${date}T00:00:00.000Z`) }
function previousDay(date: string) {
  const value = dateValue(date)
  value.setUTCDate(value.getUTCDate() - 1)
  return value.toISOString().slice(0, 10)
}
function serializeRoutine(routine: RoutineWithCompletions, today: string) {
  const dates = new Set(routine.completions.map((item) => item.completedOn.toISOString().slice(0, 10)))
  let cursor = dates.has(today) ? today : previousDay(today)
  let currentStreak = 0
  while (dates.has(cursor)) { currentStreak += 1; cursor = previousDay(cursor) }
  return {
    id: routine.id,
    title: routine.title,
    category: routine.category,
    frequency: routine.frequency,
    selectedDays: routine.selectedDays,
    timeOfDay: routine.timeOfDay,
    description: routine.description ?? undefined,
    completedToday: dates.has(today),
    history: Object.fromEntries([...dates].map((date) => [date, true])),
    currentStreak,
  }
}
function currentDate(value: unknown) {
  const parsed = dateSchema.safeParse(value)
  return parsed.success ? parsed.data : new Date().toISOString().slice(0, 10)
}
selfCareRouter.use(authenticate)

selfCareRouter.get('/', async (req, res) => {
  const userId = requireUserId(req)
  const today = currentDate(req.query.today)
  const routines = await prisma.selfCareRoutine.findMany({ where: { userId }, include: includeCompletions, orderBy: { createdAt: 'asc' } })
  res.json({ data: routines.map((routine) => serializeRoutine(routine, today)) })
})

selfCareRouter.put('/', async (req, res) => {
  const userId = requireUserId(req)
  const inputs = z.array(selfCareInputSchema).max(250).parse(req.body)
  const today = new Date().toISOString().slice(0, 10)
  const routines = await prisma.$transaction(async (tx) => {
    if (await tx.selfCareRoutine.count({ where: { userId } })) {
      throw new HttpError(409, 'SELF_CARE_ALREADY_INITIALIZED', 'Self-care routines have already been initialized for this account.')
    }
    for (const input of inputs) await tx.selfCareRoutine.create({ data: { ...input, userId } })
    return tx.selfCareRoutine.findMany({ where: { userId }, include: includeCompletions, orderBy: { createdAt: 'asc' } })
  })
  res.json({ data: routines.map((routine) => serializeRoutine(routine, today)) })
})

selfCareRouter.post('/', async (req, res) => {
  const userId = requireUserId(req)
  const input = selfCareInputSchema.parse(req.body)
  const routine = await prisma.selfCareRoutine.create({ data: { ...input, userId }, include: includeCompletions })
  res.status(201).json({ data: serializeRoutine(routine, new Date().toISOString().slice(0, 10)) })
})

selfCareRouter.patch('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const input = selfCarePatchSchema.parse(req.body)
  const result = await prisma.selfCareRoutine.updateMany({ where: { id, userId }, data: input })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Self-care routine was not found.')
  const routine = await prisma.selfCareRoutine.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeRoutine(routine, new Date().toISOString().slice(0, 10)) })
})

selfCareRouter.put('/:id/completions/:date', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const date = dateSchema.parse(req.params.date)
  const { completed } = selfCareCompletionSchema.parse(req.body)
  const routine = await prisma.selfCareRoutine.findFirst({ where: { id, userId } })
  if (!routine) throw new HttpError(404, 'NOT_FOUND', 'Self-care routine was not found.')
  if (completed) await prisma.selfCareCompletion.createMany({ data: [{ routineId: id, completedOn: dateValue(date) }], skipDuplicates: true })
  else await prisma.selfCareCompletion.deleteMany({ where: { routineId: id, completedOn: dateValue(date) } })
  const updated = await prisma.selfCareRoutine.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeRoutine(updated, date) })
})

selfCareRouter.delete('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const result = await prisma.selfCareRoutine.deleteMany({ where: { id, userId } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Self-care routine was not found.')
  res.status(204).end()
})

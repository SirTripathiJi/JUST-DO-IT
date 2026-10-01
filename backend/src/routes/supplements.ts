import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'
import { supplementCompletionSchema, supplementInputSchema, supplementPatchSchema } from '../validators/supplement.js'

export const supplementRouter = Router()
const idSchema = z.string().uuid()
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
})
const includeCompletions = { completions: { orderBy: { completedOn: 'asc' as const } } }
type SupplementWithCompletions = Prisma.SupplementGetPayload<{ include: typeof includeCompletions }>
const timingToDatabase = { morning: 'morning', noon: 'noon', evening: 'evening', bedtime: 'bedtime', 'with-meal': 'with_meal' } as const
const frequencyToDatabase = { daily: 'daily', 'specific-days': 'specific_days', 'as-needed': 'as_needed' } as const

function dateValue(date: string) { return new Date(`${date}T00:00:00.000Z`) }
function dayBefore(date: string) {
  const value = dateValue(date)
  value.setUTCDate(value.getUTCDate() - 1)
  return value.toISOString().slice(0, 10)
}
function streak(dates: Set<string>, date: string) {
  let current = dates.has(date) ? date : dayBefore(date)
  let count = 0
  while (dates.has(current)) { count += 1; current = dayBefore(current) }
  return count
}
function serializeSupplement(supplement: SupplementWithCompletions, today: string) {
  const dates = new Set(supplement.completions.map((entry) => entry.completedOn.toISOString().slice(0, 10)))
  return {
    id: supplement.id,
    name: supplement.name,
    dosage: supplement.dosage,
    unit: supplement.unit,
    timing: supplement.timing === 'with_meal' ? 'with-meal' : supplement.timing,
    frequency: supplement.frequency.replace('_', '-'),
    selectedDays: supplement.selectedDays,
    notes: supplement.notes ?? undefined,
    reminder: supplement.reminder,
    reminderTime: supplement.reminderTime ?? undefined,
    category: supplement.category ?? undefined,
    takenToday: dates.has(today),
    history: Object.fromEntries([...dates].map((date) => [date, true])),
    currentStreak: streak(dates, today),
    lastTakenDate: [...dates].at(-1),
  }
}
function createData(input: z.infer<typeof supplementInputSchema>, userId: string) {
  const { timing, frequency, notes, reminderTime, category, ...inputData } = input
  return {
    ...inputData,
    userId,
    timing: timingToDatabase[timing],
    frequency: frequencyToDatabase[frequency],
    notes: notes ?? null,
    reminderTime: reminderTime ?? null,
    category: category ?? null,
  }
}
function currentDate(value: unknown) {
  const parsed = dateSchema.safeParse(value)
  return parsed.success ? parsed.data : new Date().toISOString().slice(0, 10)
}

supplementRouter.use(authenticate)

supplementRouter.get('/', async (req, res) => {
  const userId = requireUserId(req)
  const today = currentDate(req.query.today)
  const items = await prisma.supplement.findMany({ where: { userId }, include: includeCompletions, orderBy: { createdAt: 'asc' } })
  res.json({ data: items.map((item) => serializeSupplement(item, today)) })
})

supplementRouter.put('/', async (req, res) => {
  const userId = requireUserId(req)
  const items = z.array(supplementInputSchema).max(250).parse(req.body)
  const today = new Date().toISOString().slice(0, 10)
  const saved = await prisma.$transaction(async (tx) => {
    const count = await tx.supplement.count({ where: { userId } })
    if (count) throw new HttpError(409, 'SUPPLEMENTS_ALREADY_INITIALIZED', 'Supplements have already been initialized for this account.')
    for (const item of items) await tx.supplement.create({ data: createData(item, userId) })
    return tx.supplement.findMany({ where: { userId }, include: includeCompletions, orderBy: { createdAt: 'asc' } })
  })
  res.json({ data: saved.map((item) => serializeSupplement(item, today)) })
})

supplementRouter.post('/', async (req, res) => {
  const userId = requireUserId(req)
  const input = supplementInputSchema.parse(req.body)
  const item = await prisma.supplement.create({ data: createData(input, userId), include: includeCompletions })
  res.status(201).json({ data: serializeSupplement(item, new Date().toISOString().slice(0, 10)) })
})

supplementRouter.patch('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const input = supplementPatchSchema.parse(req.body)
  const { timing, frequency, ...scalar } = input
  const result = await prisma.supplement.updateMany({ where: { id, userId }, data: {
    ...scalar,
    ...(timing === undefined ? {} : { timing: timingToDatabase[timing] }),
    ...(frequency === undefined ? {} : { frequency: frequencyToDatabase[frequency] }),
  } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Supplement was not found.')
  const item = await prisma.supplement.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeSupplement(item, new Date().toISOString().slice(0, 10)) })
})

supplementRouter.put('/:id/completions/:date', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const date = dateSchema.parse(req.params.date)
  const { completed } = supplementCompletionSchema.parse(req.body)
  const item = await prisma.supplement.findFirst({ where: { id, userId } })
  if (!item) throw new HttpError(404, 'NOT_FOUND', 'Supplement was not found.')
  if (completed) await prisma.supplementCompletion.createMany({ data: [{ supplementId: id, completedOn: dateValue(date) }], skipDuplicates: true })
  else await prisma.supplementCompletion.deleteMany({ where: { supplementId: id, completedOn: dateValue(date) } })
  const updated = await prisma.supplement.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeSupplement(updated, date) })
})

supplementRouter.delete('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const result = await prisma.supplement.deleteMany({ where: { id, userId } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Supplement was not found.')
  res.status(204).end()
})

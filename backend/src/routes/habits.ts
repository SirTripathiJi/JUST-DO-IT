import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'
import { archivedSchema, habitCompletionSchema, habitInputSchema, habitPatchSchema } from '../validators/habit.js'

export const habitRouter = Router()
const includeCompletions = { completions: { orderBy: { completedOn: 'asc' as const } } }
const idSchema = z.string().uuid()
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
})

type HabitWithCompletions = Prisma.HabitGetPayload<{ include: typeof includeCompletions }>

function dateValue(date: string) {
  return new Date(`${date}T00:00:00.000Z`)
}

function dayBefore(date: string) {
  const previous = dateValue(date)
  previous.setUTCDate(previous.getUTCDate() - 1)
  return previous.toISOString().slice(0, 10)
}

function habitStreak(dates: Set<string>, today: string): number {
  let cursor = dates.has(today) ? today : dayBefore(today)
  let streak = 0
  while (dates.has(cursor)) {
    streak += 1
    cursor = dayBefore(cursor)
  }
  return streak
}

function serializeHabit(habit: HabitWithCompletions, today: string) {
  const dates = new Set(habit.completions.map((completion) => completion.completedOn.toISOString().slice(0, 10)))
  return {
    id: habit.id,
    title: habit.title,
    icon: habit.icon ?? undefined,
    description: habit.description ?? undefined,
    frequency: habit.frequency,
    selectedDays: habit.selectedDays,
    targetPerDay: habit.targetPerDay,
    targetUnit: habit.targetUnit ?? undefined,
    currentStreak: habitStreak(dates, today),
    bestStreak: habit.bestStreak,
    completions: Object.fromEntries([...dates].map((date) => [date, true])),
    category: habit.category,
    timeOfDay: habit.timeOfDay ?? undefined,
    color: habit.color ?? undefined,
    isArchived: habit.archived,
    reminderTime: habit.reminderTime ?? undefined,
    createdAt: habit.createdAt.toISOString(),
  }
}

function currentDate(value: unknown): string {
  const parsed = dateSchema.safeParse(value)
  if (parsed.success) return parsed.data
  return new Date().toISOString().slice(0, 10)
}

function createData(input: z.infer<typeof habitInputSchema>, userId: string) {
  const { completions, ...habit } = input
  return {
    userId,
    ...habit,
    icon: habit.icon ?? null,
    description: habit.description ?? null,
    targetUnit: habit.targetUnit ?? null,
    timeOfDay: habit.timeOfDay ?? null,
    color: habit.color ?? null,
    reminderTime: habit.reminderTime ?? null,
    completions: {
      create: Object.entries(completions ?? {}).filter(([, done]) => done).map(([date]) => ({ completedOn: dateValue(date) })),
    },
  }
}

habitRouter.use(authenticate)

habitRouter.get('/', async (req, res) => {
  const userId = requireUserId(req)
  const today = currentDate(req.query.today)
  const habits = await prisma.habit.findMany({ where: { userId }, include: includeCompletions, orderBy: { createdAt: 'desc' } })
  res.json({ data: habits.map((habit) => serializeHabit(habit, today)) })
})

habitRouter.put('/', async (req, res) => {
  const userId = requireUserId(req)
  const habits = z.array(habitInputSchema).max(500).parse(req.body)
  const today = new Date().toISOString().slice(0, 10)
  const saved = await prisma.$transaction(async (tx) => {
    const existingCount = await tx.habit.count({ where: { userId } })
    if (existingCount > 0) throw new HttpError(409, 'HABITS_ALREADY_INITIALIZED', 'Habits have already been initialized for this account.')
    for (const habit of habits) await tx.habit.create({ data: createData(habit, userId) })
    return tx.habit.findMany({ where: { userId }, include: includeCompletions, orderBy: { createdAt: 'desc' } })
  })
  res.json({ data: saved.map((habit) => serializeHabit(habit, today)) })
})

habitRouter.post('/', async (req, res) => {
  const userId = requireUserId(req)
  const input = habitInputSchema.parse(req.body)
  const habit = await prisma.habit.create({ data: createData(input, userId), include: includeCompletions })
  res.status(201).json({ data: serializeHabit(habit, new Date().toISOString().slice(0, 10)) })
})

habitRouter.patch('/:id/archive', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const { archived } = archivedSchema.parse(req.body)
  const result = await prisma.habit.updateMany({ where: { id, userId }, data: { archived } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Habit was not found.')
  const habit = await prisma.habit.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeHabit(habit, new Date().toISOString().slice(0, 10)) })
})

habitRouter.put('/:id/completions/:date', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const date = dateSchema.parse(req.params.date)
  const { completed } = habitCompletionSchema.parse(req.body)
  const habit = await prisma.habit.findFirst({ where: { id, userId }, include: includeCompletions })
  if (!habit) throw new HttpError(404, 'NOT_FOUND', 'Habit was not found.')
  const dateSet = new Set(habit.completions.map((item) => item.completedOn.toISOString().slice(0, 10)))
  if (completed) dateSet.add(date)
  else dateSet.delete(date)
  const bestStreak = Math.max(habit.bestStreak, habitStreak(dateSet, date))
  await prisma.$transaction(async (tx) => {
    if (completed) {
      await tx.habitCompletion.createMany({ data: [{ habitId: id, completedOn: dateValue(date) }], skipDuplicates: true })
    } else {
      await tx.habitCompletion.deleteMany({ where: { habitId: id, completedOn: dateValue(date) } })
    }
    await tx.habit.update({ where: { id }, data: { bestStreak } })
  })
  const updated = await prisma.habit.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeHabit(updated, date) })
})

habitRouter.patch('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const input = habitPatchSchema.parse(req.body)
  const result = await prisma.habit.updateMany({ where: { id, userId }, data: input })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Habit was not found.')
  const habit = await prisma.habit.findFirstOrThrow({ where: { id, userId }, include: includeCompletions })
  res.json({ data: serializeHabit(habit, new Date().toISOString().slice(0, 10)) })
})

habitRouter.delete('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const result = await prisma.habit.deleteMany({ where: { id, userId } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Habit was not found.')
  res.status(204).end()
})

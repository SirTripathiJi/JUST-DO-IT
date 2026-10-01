import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'

export const waterRouter = Router()
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
})
const intakeSchema = z.object({
  amountMl: z.number().int().min(1).max(5000),
  containerName: z.string().trim().min(1).max(100).optional(),
}).strict()
const targetSchema = z.object({ targetMl: z.number().int().min(250).max(10_000) }).strict()
const includeEntries = { entries: { orderBy: { timestamp: 'desc' as const } } }

function serializeWaterLog(log: { date: Date; targetMl: number; entries: { id: string; amountMl: number; timestamp: Date; containerName: string | null }[] }) {
  return {
    date: log.date.toISOString().slice(0, 10),
    targetMl: log.targetMl,
    currentMl: log.entries.reduce((sum, entry) => sum + entry.amountMl, 0),
    entries: log.entries.map((entry) => ({
      id: entry.id,
      amountMl: entry.amountMl,
      timestamp: entry.timestamp.toISOString(),
      ...(entry.containerName ? { containerName: entry.containerName } : {}),
    })),
  }
}

async function findOrCreateLog(userId: string, date: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { waterTargetMl: true } })
  return prisma.waterLog.upsert({
    where: { userId_date: { userId, date: new Date(`${date}T00:00:00.000Z`) } },
    create: { userId, date: new Date(`${date}T00:00:00.000Z`), targetMl: profile?.waterTargetMl ?? 2500 },
    update: {},
    include: includeEntries,
  })
}

waterRouter.use(authenticate)

waterRouter.get('/:date', async (req, res) => {
  const userId = requireUserId(req)
  const date = dateSchema.parse(req.params.date)
  const log = await findOrCreateLog(userId, date)
  res.json({ data: serializeWaterLog(log) })
})

waterRouter.post('/:date/entries', async (req, res) => {
  const userId = requireUserId(req)
  const date = dateSchema.parse(req.params.date)
  const input = intakeSchema.parse(req.body)
  const log = await findOrCreateLog(userId, date)
  await prisma.waterLogEntry.create({ data: { waterLogId: log.id, ...input } })
  const updated = await prisma.waterLog.findFirstOrThrow({ where: { id: log.id, userId }, include: includeEntries })
  res.status(201).json({ data: serializeWaterLog(updated) })
})

waterRouter.patch('/:date/target', async (req, res) => {
  const userId = requireUserId(req)
  const date = dateSchema.parse(req.params.date)
  const { targetMl } = targetSchema.parse(req.body)
  const log = await findOrCreateLog(userId, date)
  await prisma.waterLog.updateMany({ where: { id: log.id, userId }, data: { targetMl } })
  const updated = await prisma.waterLog.findFirstOrThrow({ where: { id: log.id, userId }, include: includeEntries })
  res.json({ data: serializeWaterLog(updated) })
})

waterRouter.delete('/:date/entries', async (req, res) => {
  const userId = requireUserId(req)
  const date = dateSchema.parse(req.params.date)
  const log = await prisma.waterLog.findUnique({ where: { userId_date: { userId, date: new Date(`${date}T00:00:00.000Z`) } } })
  if (!log) throw new HttpError(404, 'NOT_FOUND', 'Water log was not found.')
  await prisma.waterLogEntry.deleteMany({ where: { waterLogId: log.id } })
  const updated = await prisma.waterLog.findFirstOrThrow({ where: { id: log.id, userId }, include: includeEntries })
  res.json({ data: serializeWaterLog(updated) })
})

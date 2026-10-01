import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http-error.js'
import { authenticate, requireUserId } from '../middleware/authenticate.js'
import { paginationSchema, taskInputSchema, taskPatchSchema } from '../validators/task.js'

export const taskRouter = Router()
const includeSubtasks = { subtasks: { orderBy: { position: 'asc' as const } } }
const idSchema = z.string().uuid()

function toDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined || value === null) return value
  return new Date(`${value}T00:00:00.000Z`)
}

type TaskWithSubtasks = Prisma.TaskGetPayload<{ include: { subtasks: true } }>

export function serializeTask(task: TaskWithSubtasks) {
  return {
    ...task,
    dueDate: task.dueDate?.toISOString().slice(0, 10),
    completedAt: task.completedAt?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    subtasks: task.subtasks.map((subtask) => ({ id: subtask.id, title: subtask.title, completed: subtask.completed })),
  }
}

taskRouter.use(authenticate)

taskRouter.get('/', async (req, res) => {
  const userId = requireUserId(req)
  const { limit, offset } = paginationSchema.parse(req.query)
  const [items, total] = await Promise.all([
    prisma.task.findMany({ where: { userId }, include: includeSubtasks, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], take: limit, skip: offset }),
    prisma.task.count({ where: { userId } }),
  ])
  res.json({ data: items.map(serializeTask), page: { limit, offset, total } })
})

taskRouter.post('/', async (req, res) => {
  const userId = requireUserId(req)
  const input = taskInputSchema.parse(req.body)
  const task = await prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      dueDate: toDate(input.dueDate),
      dueTime: input.dueTime ?? null,
      endTime: input.endTime ?? null,
      completed: input.completed,
      completedAt: input.completed ? new Date() : null,
      category: input.category,
      tags: input.tags,
      notes: input.notes ?? null,
      recurring: input.recurring === 'none' ? null : input.recurring ?? null,
      reminder: input.reminder,
      subtasks: { create: input.subtasks.map((subtask, position) => ({ ...subtask, position })) },
    },
    include: includeSubtasks,
  })
  res.status(201).json({ data: serializeTask(task) })
})

taskRouter.patch('/:id/completion', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const { completed } = z.object({ completed: z.boolean() }).strict().parse(req.body)
  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: { completed, completedAt: completed ? new Date() : null },
  })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Task was not found.')
  const task = await prisma.task.findFirstOrThrow({ where: { id, userId }, include: includeSubtasks })
  res.json({ data: serializeTask(task) })
})

taskRouter.patch('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const input = taskPatchSchema.parse(req.body)
  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: toDate(input.dueDate) } : {}),
      ...(input.dueTime !== undefined ? { dueTime: input.dueTime } : {}),
      ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
      ...(input.completed !== undefined ? { completed: input.completed, completedAt: input.completed ? new Date() : null } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.recurring !== undefined ? { recurring: input.recurring === 'none' ? null : input.recurring } : {}),
      ...(input.reminder !== undefined ? { reminder: input.reminder } : {}),
    },
  })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Task was not found.')
  if (input.subtasks !== undefined) {
    await prisma.$transaction([
      prisma.taskSubtask.deleteMany({ where: { taskId: id } }),
      ...input.subtasks.map((subtask, position) => prisma.taskSubtask.create({ data: { taskId: id, ...subtask, position } })),
    ])
  }
  const task = await prisma.task.findFirstOrThrow({ where: { id, userId }, include: includeSubtasks })
  res.json({ data: serializeTask(task) })
})

taskRouter.delete('/:id', async (req, res) => {
  const userId = requireUserId(req)
  const id = idSchema.parse(req.params.id)
  const result = await prisma.task.deleteMany({ where: { id, userId } })
  if (!result.count) throw new HttpError(404, 'NOT_FOUND', 'Task was not found.')
  res.status(204).end()
})

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { Server } from 'node:http'

const mocks = vi.hoisted(() => ({
  findUserForSession: vi.fn(),
  registerUser: vi.fn(),
  createSession: vi.fn(),
  authenticateUser: vi.fn(),
  deleteSession: vi.fn(),
  taskFindMany: vi.fn(),
  taskCount: vi.fn(),
  taskDeleteMany: vi.fn(),
}))

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    task: {
      findMany: mocks.taskFindMany,
      count: mocks.taskCount,
      deleteMany: mocks.taskDeleteMany,
    },
  },
}))

vi.mock('../services/auth-service.js', () => ({
  findUserForSession: mocks.findUserForSession,
  registerUser: mocks.registerUser,
  createSession: mocks.createSession,
  authenticateUser: mocks.authenticateUser,
  deleteSession: mocks.deleteSession,
}))

const { app } = await import('../app.js')
let server: Server

beforeAll(async () => {
  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

describe('task API authentication and ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findUserForSession.mockResolvedValue({ id: '9c320418-7df7-46df-a3d2-615353bd4543', email: 'owner@example.com', profile: null })
    mocks.taskFindMany.mockResolvedValue([])
    mocks.taskCount.mockResolvedValue(0)
  })

  it('rejects unauthenticated task reads', async () => {
    const response = await request(server).get('/api/tasks')
    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHENTICATED')
    expect(mocks.taskFindMany).not.toHaveBeenCalled()
  })

  it('registers users and issues an HttpOnly session cookie', async () => {
    const user = { id: '9c320418-7df7-46df-a3d2-615353bd4543', email: 'owner@example.com', profile: null }
    mocks.registerUser.mockResolvedValue(user)
    mocks.createSession.mockResolvedValue({ token: 'random-session-token', expiresAt: new Date(Date.now() + 60_000) })

    const response = await request(server)
      .post('/api/auth/register')
      .send({ email: ' OWNER@example.com ', password: 'a-strong-test-password', name: 'Owner' })

    expect(response.status).toBe(201)
    expect(mocks.registerUser).toHaveBeenCalledWith({ email: 'OWNER@example.com', password: 'a-strong-test-password', name: 'Owner' })
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
    expect(response.headers['set-cookie'][0]).toContain('SameSite=Lax')
  })

  it('validates registration input before creating an account', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({ email: 'owner@example.com', password: 'short', name: '' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mocks.registerUser).not.toHaveBeenCalled()
  })

  it('rejects malformed resource IDs as validation errors', async () => {
    const response = await request(server)
      .delete('/api/tasks/not-a-uuid')
      .set('Cookie', 'jid_session=opaque-test-token')

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mocks.taskDeleteMany).not.toHaveBeenCalled()
  })

  it('scopes list reads to the authenticated user and caps pagination', async () => {
    const response = await request(server)
      .get('/api/tasks?limit=25&offset=5')
      .set('Cookie', 'jid_session=opaque-test-token')

    expect(response.status).toBe(200)
    expect(mocks.taskFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: '9c320418-7df7-46df-a3d2-615353bd4543' },
      take: 25,
      skip: 5,
    }))
  })

  it('returns not found when a user tries to delete a task they do not own', async () => {
    mocks.taskDeleteMany.mockResolvedValue({ count: 0 })
    const response = await request(server)
      .delete('/api/tasks/41330f40-c72d-4945-a253-795066c4ab2b')
      .set('Cookie', 'jid_session=opaque-test-token')

    expect(response.status).toBe(404)
    expect(mocks.taskDeleteMany).toHaveBeenCalledWith({
      where: { id: '41330f40-c72d-4945-a253-795066c4ab2b', userId: '9c320418-7df7-46df-a3d2-615353bd4543' },
    })
  })

  it('returns structured validation errors for invalid task input', async () => {
    const response = await request(server)
      .post('/api/tasks')
      .set('Cookie', 'jid_session=opaque-test-token')
      .send({ title: '', completed: false })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})

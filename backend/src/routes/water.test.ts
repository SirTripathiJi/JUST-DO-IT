import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { Server } from 'node:http'

const mocks = vi.hoisted(() => ({
  findUserForSession: vi.fn(),
  waterUpsert: vi.fn(),
  waterFindUnique: vi.fn(),
  waterFindFirstOrThrow: vi.fn(),
  waterUpdateMany: vi.fn(),
  entryCreate: vi.fn(),
  entryDeleteMany: vi.fn(),
  profileFindUnique: vi.fn(),
}))

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    waterLog: {
      upsert: mocks.waterUpsert,
      findUnique: mocks.waterFindUnique,
      findFirstOrThrow: mocks.waterFindFirstOrThrow,
      updateMany: mocks.waterUpdateMany,
    },
    waterLogEntry: { create: mocks.entryCreate, deleteMany: mocks.entryDeleteMany },
    profile: { findUnique: mocks.profileFindUnique },
  },
}))

vi.mock('../services/auth-service.js', () => ({ findUserForSession: mocks.findUserForSession }))

const { app } = await import('../app.js')
let server: Server
const userId = '9c320418-7df7-46df-a3d2-615353bd4543'
const date = new Date('2026-10-01T00:00:00.000Z')

beforeAll(async () => {
  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

describe('water API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findUserForSession.mockResolvedValue({ id: userId, email: 'owner@example.com', profile: null })
    mocks.profileFindUnique.mockResolvedValue({ waterTargetMl: 2200 })
    mocks.waterUpsert.mockResolvedValue({ date, targetMl: 2200, entries: [] })
  })

  it('requires authentication', async () => {
    const response = await request(server).get('/api/water/2026-10-01')
    expect(response.status).toBe(401)
    expect(mocks.waterUpsert).not.toHaveBeenCalled()
  })

  it('creates and reads only the signed-in user date log', async () => {
    const response = await request(server)
      .get('/api/water/2026-10-01')
      .set('Cookie', 'jid_session=opaque-test-token')

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual({ date: '2026-10-01', targetMl: 2200, currentMl: 0, entries: [] })
    expect(mocks.waterUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_date: { userId, date } },
      create: { userId, date, targetMl: 2200 },
    }))
  })

  it('rejects invalid intake amounts before writing', async () => {
    const response = await request(server)
      .post('/api/water/2026-10-01/entries')
      .set('Cookie', 'jid_session=opaque-test-token')
      .send({ amountMl: -30 })

    expect(response.status).toBe(400)
    expect(mocks.waterUpsert).not.toHaveBeenCalled()
    expect(mocks.entryCreate).not.toHaveBeenCalled()
  })

  it('rejects impossible dates', async () => {
    const response = await request(server)
      .get('/api/water/2026-02-30')
      .set('Cookie', 'jid_session=opaque-test-token')

    expect(response.status).toBe(400)
    expect(mocks.waterUpsert).not.toHaveBeenCalled()
  })
})

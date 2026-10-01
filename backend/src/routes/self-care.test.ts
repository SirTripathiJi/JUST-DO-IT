import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { Server } from 'node:http'

const mocks = vi.hoisted(() => ({
  findUserForSession: vi.fn(),
  routineFindMany: vi.fn(),
  routineUpdateMany: vi.fn(),
}))
vi.mock('../lib/prisma.js', () => ({
  prisma: { selfCareRoutine: { findMany: mocks.routineFindMany, updateMany: mocks.routineUpdateMany } },
}))
vi.mock('../services/auth-service.js', () => ({ findUserForSession: mocks.findUserForSession }))
const { app } = await import('../app.js')
let server: Server
const userId = '9c320418-7df7-46df-a3d2-615353bd4543'

beforeAll(async () => {
  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
})
afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

describe('self-care API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findUserForSession.mockResolvedValue({ id: userId, email: 'owner@example.com', profile: null })
  })

  it('requires authentication to list routines', async () => {
    const response = await request(server).get('/api/self-care')
    expect(response.status).toBe(401)
    expect(mocks.routineFindMany).not.toHaveBeenCalled()
  })

  it('returns not found when updating a routine owned by another user', async () => {
    mocks.routineUpdateMany.mockResolvedValue({ count: 0 })
    const response = await request(server)
      .patch('/api/self-care/b4378b5c-23ed-47fb-bef8-5e9114a87f30')
      .set('Cookie', 'jid_session=opaque-test-token')
      .send({ title: 'Evening walk' })

    expect(response.status).toBe(404)
    expect(mocks.routineUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'b4378b5c-23ed-47fb-bef8-5e9114a87f30', userId },
    }))
  })
})

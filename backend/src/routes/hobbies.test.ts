import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { Server } from 'node:http'

const mocks = vi.hoisted(() => ({
  findUserForSession: vi.fn(),
  hobbyFindFirst: vi.fn(),
  hobbySessionCreate: vi.fn(),
}))
vi.mock('../lib/prisma.js', () => ({
  prisma: { hobby: { findFirst: mocks.hobbyFindFirst }, hobbySession: { create: mocks.hobbySessionCreate } },
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

describe('hobby API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findUserForSession.mockResolvedValue({ id: userId, email: 'owner@example.com', profile: null })
  })

  it('requires authentication before reading hobbies', async () => {
    const response = await request(server).get('/api/hobbies')
    expect(response.status).toBe(401)
    expect(mocks.hobbyFindFirst).not.toHaveBeenCalled()
  })

  it('does not create a session for a hobby owned by another user', async () => {
    mocks.hobbyFindFirst.mockResolvedValue(null)
    const response = await request(server)
      .post('/api/hobbies/b4378b5c-23ed-47fb-bef8-5e9114a87f30/sessions')
      .set('Cookie', 'jid_session=opaque-test-token')
      .send({ date: '2026-10-01', durationMinutes: 45, rating: 4 })

    expect(response.status).toBe(404)
    expect(mocks.hobbyFindFirst).toHaveBeenCalledWith({ where: { id: 'b4378b5c-23ed-47fb-bef8-5e9114a87f30', userId } })
    expect(mocks.hobbySessionCreate).not.toHaveBeenCalled()
  })
})

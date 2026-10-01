import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { Server } from 'node:http'

const mocks = vi.hoisted(() => ({
  findUserForSession: vi.fn(),
  supplementFindMany: vi.fn(),
  supplementUpdateMany: vi.fn(),
  supplementFindFirstOrThrow: vi.fn(),
  supplementDeleteMany: vi.fn(),
}))

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    supplement: {
      findMany: mocks.supplementFindMany,
      updateMany: mocks.supplementUpdateMany,
      findFirstOrThrow: mocks.supplementFindFirstOrThrow,
      deleteMany: mocks.supplementDeleteMany,
    },
  },
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

describe('supplement API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findUserForSession.mockResolvedValue({ id: userId, email: 'owner@example.com', profile: null })
  })

  it('requires authentication before listing supplements', async () => {
    const response = await request(server).get('/api/supplements')
    expect(response.status).toBe(401)
    expect(mocks.supplementFindMany).not.toHaveBeenCalled()
  })

  it('scopes supplement updates to the authenticated user', async () => {
    mocks.supplementUpdateMany.mockResolvedValue({ count: 0 })
    const response = await request(server)
      .patch('/api/supplements/b4378b5c-23ed-47fb-bef8-5e9114a87f30')
      .set('Cookie', 'jid_session=opaque-test-token')
      .send({ name: 'Vitamin D' })

    expect(response.status).toBe(404)
    expect(mocks.supplementUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'b4378b5c-23ed-47fb-bef8-5e9114a87f30', userId },
    }))
    expect(mocks.supplementFindFirstOrThrow).not.toHaveBeenCalled()
  })

  it('rejects unsupported supplement timing values', async () => {
    const response = await request(server)
      .post('/api/supplements')
      .set('Cookie', 'jid_session=opaque-test-token')
      .send({ name: 'Vitamin D', dosage: '1', unit: 'tablet', timing: 'midnight' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})

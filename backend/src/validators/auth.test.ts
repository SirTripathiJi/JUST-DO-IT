import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './auth.js'

describe('authentication request validation', () => {
  it('normalizes whitespace in registration input and accepts a valid payload', () => {
    const result = registerSchema.parse({
      email: '  person@example.com ',
      password: 'a-long-test-password',
      name: '  Example Person  ',
    })

    expect(result).toEqual({ email: 'person@example.com', password: 'a-long-test-password', name: 'Example Person' })
  })

  it('rejects short passwords, malformed emails, and unexpected fields', () => {
    expect(registerSchema.safeParse({ email: 'bad', password: 'short', name: 'Name' }).success).toBe(false)
    expect(registerSchema.safeParse({ email: 'a@example.com', password: 'a-long-test-password', name: 'Name', role: 'admin' }).success).toBe(false)
  })

  it('rejects login payloads without a password', () => {
    expect(loginSchema.safeParse({ email: 'person@example.com', password: '' }).success).toBe(false)
  })
})

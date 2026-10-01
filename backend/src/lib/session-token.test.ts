import { describe, expect, it } from 'vitest'
import { createSessionToken, hashSessionToken } from './session-token.js'

describe('session token helpers', () => {
  it('creates unique cryptographically random URL-safe tokens', () => {
    const first = createSessionToken()
    const second = createSessionToken()

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(second).not.toBe(first)
  })

  it('stores a fixed-length digest instead of the bearer token', () => {
    const token = createSessionToken()
    const digest = hashSessionToken(token)

    expect(digest).toMatch(/^[a-f0-9]{64}$/)
    expect(digest).not.toBe(token)
    expect(hashSessionToken(token)).toBe(digest)
  })
})

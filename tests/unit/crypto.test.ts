import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import {
  encryptCredentials,
  decryptCredentials,
  safeEncryptCredentials,
  safeDecryptCredentials,
} from '@/lib/crypto'

// 64 hex chars = 32 bytes, a valid AES-256 key
const TEST_KEY = 'a'.repeat(64)

describe('crypto (with ENCRYPTION_KEY set)', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY
  })

  it('round-trips a credentials object', () => {
    const creds = { access_token: 'EAA-secret', phone_number_id: '12345' }
    const enc = encryptCredentials(creds)
    expect(enc).not.toContain('EAA-secret')
    expect(decryptCredentials(enc)).toEqual(creds)
  })

  it('emits iv:authTag:ciphertext in hex', () => {
    const enc = encryptCredentials({ a: 1 })
    const parts = enc.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toMatch(/^[0-9a-f]{24}$/) // 12-byte iv
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/) // 16-byte auth tag
    expect(parts.every((p) => /^[0-9a-f]*$/.test(p))).toBe(true)
  })

  it('produces a distinct ciphertext each call (random iv)', () => {
    const a = encryptCredentials({ x: 'same' })
    const b = encryptCredentials({ x: 'same' })
    expect(a).not.toBe(b)
    expect(decryptCredentials(a)).toEqual(decryptCredentials(b))
  })

  it('returns null on a tampered auth tag', () => {
    const enc = encryptCredentials({ secret: 'v' })
    const [iv, , ct] = enc.split(':')
    const tampered = `${iv}:${'0'.repeat(32)}:${ct}`
    expect(decryptCredentials(tampered)).toBeNull()
  })

  it('returns null on a malformed string', () => {
    expect(decryptCredentials('garbage')).toBeNull()
    expect(decryptCredentials('only:two')).toBeNull()
  })

  it('safeEncrypt/safeDecrypt round-trip when key is present', () => {
    const creds = { token: 'abc' }
    expect(safeDecryptCredentials(safeEncryptCredentials(creds))).toEqual(creds)
  })

  it('safeDecrypt reads legacy unencrypted JSON stored before a key existed', () => {
    expect(safeDecryptCredentials('{"legacy":true}')).toEqual({ legacy: true })
  })
})

describe('crypto (without ENCRYPTION_KEY)', () => {
  afterEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY
  })

  it('safeEncrypt falls back to plain JSON and safeDecrypt reads it back', () => {
    delete process.env.ENCRYPTION_KEY
    const creds = { token: 'plain' }
    const stored = safeEncryptCredentials(creds)
    expect(stored).toBe(JSON.stringify(creds))
    expect(safeDecryptCredentials(stored)).toEqual(creds)
  })

  it('encryptCredentials throws when the key is missing', () => {
    delete process.env.ENCRYPTION_KEY
    expect(() => encryptCredentials({ a: 1 })).toThrow(/ENCRYPTION_KEY/)
  })
})

describe('crypto key validation', () => {
  afterEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY
  })

  it('rejects a key that is not 32 bytes', () => {
    process.env.ENCRYPTION_KEY = 'abcd'
    expect(() => encryptCredentials({ a: 1 })).toThrow(/64 hex chars/)
  })
})

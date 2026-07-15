/**
 * AES-256-GCM symmetric encryption for sensitive channel credentials.
 * Uses ENCRYPTION_KEY env var (must be 32 bytes / 64 hex chars).
 * Spec: "Channel tokens (WhatsApp, Instagram) AES-encrypted before storing."
 */

import { log } from '@/lib/logger'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex) throw new Error('ENCRYPTION_KEY env var is not set')
  const key = Buffer.from(hex, 'hex')
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 64 hex chars (32 bytes)')
  return key
}

/**
 * Encrypt a plain-text JSON credentials object.
 * Returns a string in the format: iv:authTag:ciphertext (all hex).
 */
export function encryptCredentials(credentials: Record<string, unknown>): string {
  const crypto = require('crypto') as typeof import('crypto')
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plaintext = JSON.stringify(credentials)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt a string produced by encryptCredentials().
 * Returns the original credentials object, or null on failure.
 */
export function decryptCredentials(encrypted: string): Record<string, unknown> | null {
  try {
    const crypto = require('crypto') as typeof import('crypto')
    const key = getKey()
    const [ivHex, authTagHex, cipherHex] = encrypted.split(':')
    if (!ivHex || !authTagHex || !cipherHex) return null
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const ciphertext = Buffer.from(cipherHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return JSON.parse(decrypted.toString('utf8'))
  } catch {
    return null
  }
}

/**
 * Safe encrypt — returns empty object string if ENCRYPTION_KEY is missing
 * (dev convenience; logs a warning).
 */
export function safeEncryptCredentials(credentials: Record<string, unknown>): string {
  if (!process.env.ENCRYPTION_KEY) {
    log.warn('ENCRYPTION_KEY not set — storing credentials unencrypted (dev only)', { route: 'crypto:safeEncryptCredentials' })
    return JSON.stringify(credentials)
  }
  return encryptCredentials(credentials)
}

export function safeDecryptCredentials(value: string): Record<string, unknown> {
  if (!process.env.ENCRYPTION_KEY) {
    try { return JSON.parse(value) } catch { return {} }
  }
  // detect old unencrypted JSON stored before key was set
  if (value.startsWith('{')) {
    try { return JSON.parse(value) } catch { return {} }
  }
  return decryptCredentials(value) ?? {}
}

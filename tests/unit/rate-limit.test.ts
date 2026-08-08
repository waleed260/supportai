import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  checkAccountLockout,
  recordFailedAttempt,
  resetAccountLockout,
} from '@/lib/rate-limit'

// Each test uses a unique identifier because lockout state lives in a
// module-level Map shared across the suite.
let n = 0
const id = () => `user-${Date.now()}-${n++}`

describe('account lockout — basic transitions', () => {
  it('reports a clean slate for an unknown identifier', () => {
    expect(checkAccountLockout(id())).toEqual({ locked: false, remainingAttempts: 5 })
  })

  it('decrements remaining attempts on each failure', () => {
    const u = id()
    expect(recordFailedAttempt(u)).toEqual({ remainingAttempts: 4, locked: false })
    expect(recordFailedAttempt(u)).toEqual({ remainingAttempts: 3, locked: false })
    expect(recordFailedAttempt(u)).toEqual({ remainingAttempts: 2, locked: false })
  })

  it('locks the account on the 5th failure', () => {
    const u = id()
    for (let i = 0; i < 4; i++) recordFailedAttempt(u)
    expect(recordFailedAttempt(u)).toEqual({ remainingAttempts: 0, locked: true })
    expect(checkAccountLockout(u)).toEqual({ locked: true, remainingAttempts: 0 })
  })

  it('resetAccountLockout clears all state', () => {
    const u = id()
    for (let i = 0; i < 5; i++) recordFailedAttempt(u)
    resetAccountLockout(u)
    expect(checkAccountLockout(u)).toEqual({ locked: false, remainingAttempts: 5 })
  })

  it('throttles within the progressive-delay window after a failure', () => {
    const u = id()
    recordFailedAttempt(u)
    // Same instant → still inside the 1s delay for attempt #1
    expect(checkAccountLockout(u)).toEqual({ locked: true, remainingAttempts: 4 })
  })
})

describe('account lockout — time-based transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears the throttle once the progressive delay elapses (count < 5)', () => {
    const u = id()
    recordFailedAttempt(u) // count=1, 1000ms delay
    vi.setSystemTime(1001)
    expect(checkAccountLockout(u)).toEqual({ locked: false, remainingAttempts: 4 })
  })

  it('keeps the account locked until the 15-minute window expires', () => {
    const u = id()
    for (let i = 0; i < 5; i++) recordFailedAttempt(u)
    vi.setSystemTime(5 * 60 * 1000) // 5 min in — still locked
    expect(checkAccountLockout(u)).toEqual({ locked: true, remainingAttempts: 0 })
  })

  it('auto-resets after the 15-minute lockout expires', () => {
    const u = id()
    for (let i = 0; i < 5; i++) recordFailedAttempt(u)
    vi.setSystemTime(15 * 60 * 1000 + 1)
    expect(checkAccountLockout(u)).toEqual({ locked: false, remainingAttempts: 5 })
  })
})

import { test, expect } from '@playwright/test'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env.local')
  try {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2]
      }
    }
  } catch {
    // .env.local may not exist; fall back to process env only
  }
}
loadLocalEnv()

function metaSignature(secret: string, body: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
}

function stripeSignature(secret: string, body: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  return `t=${timestamp},v1=${signature}`
}

test.describe('API input validation', () => {
  test.describe('webhooks reject malformed payloads with 400 (valid signature)', () => {
    const secret = process.env.META_MESSAGING_APP_SECRET || process.env.META_APP_SECRET
    test.skip(!secret, 'META_MESSAGING_APP_SECRET not configured')

    for (const channel of ['whatsapp', 'instagram', 'facebook'] as const) {
      test(`${channel}: malformed structure -> 400`, async ({ request }) => {
        const raw = JSON.stringify({ not_a_webhook: true })
        const res = await request.post(`${BASE_URL}/api/webhooks/${channel}`, {
          headers: {
            'x-hub-signature-256': metaSignature(secret!, raw),
            'content-type': 'application/json',
          },
          data: Buffer.from(raw, 'utf8'),
        })
        expect(res.status()).toBe(400)
      })

      test(`${channel}: invalid JSON -> 400`, async ({ request }) => {
        const raw = '{not valid json'
        const res = await request.post(`${BASE_URL}/api/webhooks/${channel}`, {
          headers: {
            'x-hub-signature-256': metaSignature(secret!, raw),
            'content-type': 'application/json',
          },
          data: Buffer.from(raw, 'utf8'),
        })
        expect(res.status()).toBe(400)
      })

      test(`${channel}: valid payload shape is accepted`, async ({ request }) => {
        const valid =
          channel === 'whatsapp'
            ? JSON.stringify({ object: 'whatsapp_business_account', entry: [] })
            : JSON.stringify({ object: 'page', entry: [] })
        const res = await request.post(`${BASE_URL}/api/webhooks/${channel}`, {
          headers: {
            'x-hub-signature-256': metaSignature(secret!, valid),
            'content-type': 'application/json',
          },
          data: Buffer.from(valid, 'utf8'),
        })
        expect(res.status()).toBeLessThan(500)
      })
    }

    test('webhook rejects invalid signature with 401', async ({ request }) => {
      const res = await request.post(`${BASE_URL}/api/webhooks/whatsapp`, {
        headers: { 'x-hub-signature-256': 'sha256=invalid', 'content-type': 'application/json' },
        data: JSON.stringify({ object: 'whatsapp_business_account' }),
      })
      expect(res.status()).toBe(401)
    })
  })

  test.describe('stripe webhook validates event structure', () => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    test.skip(!secret, 'STRIPE_WEBHOOK_SECRET not configured')

    test('malformed event (missing type/data) -> 400', async ({ request }) => {
      const raw = JSON.stringify({ id: 'evt_test', object: 'event' })
      const res = await request.post(`${BASE_URL}/api/subscriptions/stripe-webhook`, {
        headers: { 'stripe-signature': stripeSignature(secret!, raw), 'content-type': 'application/json' },
        data: Buffer.from(raw, 'utf8'),
      })
      expect(res.status()).toBe(400)
    })

    test('invalid signature -> 400', async ({ request }) => {
      const raw = JSON.stringify({ id: 'evt_test', object: 'event', type: 'invoice.paid', data: { object: {} } })
      const res = await request.post(`${BASE_URL}/api/subscriptions/stripe-webhook`, {
        headers: { 'stripe-signature': 't=1,v1=bogus', 'content-type': 'application/json' },
        data: Buffer.from(raw, 'utf8'),
      })
      expect(res.status()).toBe(400)
    })
  })

  test('meta oauth start rejects invalid channel with 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/auth/meta?channel=invalid&org_id=org_123`)
    expect(res.status()).toBe(400)
  })

  test.describe('auth-protected routes reject malformed input without a session', () => {
    const protectedRoutes: Array<{ method: string; path: string }> = [
      { method: 'POST', path: '/api/admin/actions' },
      { method: 'POST', path: '/api/knowledge' },
      { method: 'POST', path: '/api/memberships' },
      { method: 'PATCH', path: '/api/widget-settings' },
      { method: 'PUT', path: '/api/notifications/preferences' },
      { method: 'POST', path: '/api/notifications/register-device' },
      { method: 'PATCH', path: '/api/leads' },
      { method: 'PATCH', path: '/api/escalations' },
      { method: 'PATCH', path: '/api/conversations/not-a-uuid' },
      { method: 'POST', path: '/api/subscriptions/customer-portal' },
    ]

    for (const route of protectedRoutes) {
      test(`${route.method} ${route.path} -> 4xx (never 500) on malformed body`, async ({ request }) => {
        const res = await request.fetch(`${BASE_URL}${route.path}`, {
          method: route.method,
          headers: { 'content-type': 'application/json' },
          data: '{not valid json',
        })
        expect(res.status()).toBeGreaterThanOrEqual(400)
        expect(res.status()).toBeLessThan(500)
      })
    }
  })
})

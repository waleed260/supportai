# Sentry Alert Rules — Setup Guide

These rules must be configured manually in the Sentry dashboard (not deployable
via code). They are the highest-priority gap in the monitoring stack.

## Prerequisites

- Sentry project created at [sentry.io](https://sentry.io)
- `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` set in Vercel
- At least one error event has been captured (deploy once and trigger a test error)

## Steps

1. Go to **sentry.io** → your project → **Alerts** → **Create Alert**
2. For each rule below, click **Create Alert** → choose **Errors** → fill in the fields

---

### Rule 1: Webhook Handler Errors (highest priority)

| Field | Value |
|---|---|
| Name | `Webhook Handler Errors` |
| Trigger | `Errors` |
| Environment | `production` |
| Filter | `url` matches `*/api/webhooks/*` |
| Action | Send email + Slack/webhook to on-call |
| Threshold | 1 error in 5 minutes |
| Sensitivity | High |

---

### Rule 2: Error Rate Spike

| Field | Value |
|---|---|
| Name | `High Error Rate` |
| Trigger | `Errors` |
| Environment | `production` |
| Filter | (none — all routes) |
| Action | Send email + Slack |
| Threshold | `count() > 10` over `5 minutes` |
| Sensitivity | Medium |

---

### Rule 3: Stripe Signature Failures

| Field | Value |
|---|---|
| Name | `Stripe Signature Failures` |
| Trigger | `Errors` |
| Filter | `transaction` contains `stripe-webhook` |
| Action | Send email + Slack immediately |
| Threshold | 1 error in 5 minutes |
| Sensitivity | High |

---

## Verification

After configuring all three rules:

1. Trigger a test error in a webhook handler (e.g., temporarily break a DB call
   in `/api/webhooks/whatsapp`)
2. Send a test message via the Meta webhook
3. Confirm a Sentry event appears within 60 seconds
4. Confirm the alert fires within the configured evaluation window

Do NOT skip this verification. An alert that has never fired is not a
verified alert.

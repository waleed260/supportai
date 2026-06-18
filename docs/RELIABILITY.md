# Reliability, Backup & Recovery

## 1. Supabase Project Plan & PITR

| Detail | Value |
|---|---|
| Current plan | **Pro** (paid tier) |
| PITR window | **7 days** (Supabase Pro includes 7-day PITR) |
| Daily backup retention | 30 days (Supabase retains daily snapshots for 30 days) |
| Automated daily export | Scheduled via Vercel Cron Job at 06:00 UTC (`GET /api/cron/export`) |

**If on the Free tier:** PITR is **not available**. Only a single daily backup is
taken with no point-in-time granularity. That means up to 24 hours of potential
data loss if the database is corrupted between backups. **Upgrade to Pro before
onboarding any paying clients.**

## 2. What Happens If Something Goes Wrong

### Scenario A: Accidental bulk DELETE or UPDATE (application-level mistake)

1. **PITR can recover to any point within the last 7 days.** This is the primary
   recovery mechanism — PITR rewinds the entire database to a timestamp *before*
   the bad query was executed.
2. **Nightly JSON exports** in the `backups` storage bucket can recover
   individual tables without a full database rewind.
3. A full PITR restore will incur 15–60 minutes of downtime depending on dataset
   size (no read replica is configured).

### Scenario B: Database is dropped or corrupted (infrastructure failure)

1. Supabase automatically provisions a new database instance from the latest
   backup (within 1-hour SLA for Pro plans).
2. After the instance is restored, run any pending migrations via `supabase db
   push` or apply `.sql` files manually.
3. If the automated backup is stale, the nightly JSON exports serve as a
   secondary recovery source.

### Scenario C: A bad migration is deployed (schema change)

1. **Vercel instant rollback** — Vercel Dashboard -> Deployments -> find the
   last known-good deployment -> "..." -> "Rollback to this deployment".
   This reverts the application code immediately.
2. **Roll back the database** by running the corresponding down migration:
   ```
   psql "$DATABASE_URL" -f supabase/migrations/XXX_name.down.sql
   ```
3. If the bad migration was already applied, run the down migration *before*
   rolling back the Vercel deployment so the code and schema are in sync.

## 3. Nightly Scheduled Export

**Purpose:** Secondary safety net beyond PITR. Protects against application-level
mistakes discovered late (e.g., gradual data corruption that goes unnoticed for
days) that a point-in-time recovery may not cleanly handle.

**Mechanism:**
- Vercel Cron Job fires at **06:00 UTC** every day.
- Calls `GET /api/cron/export` — authenticated via `CRON_SECRET` env var.
- Reads critical tables (`organizations`, `subscriptions`, `leads`,
  `conversations`, `messages`, `memberships`, `ai_agents`, `escalations`,
  `subscription_plans`) via the service role client.
- Writes a single timestamped JSON file to the Supabase `backups` storage bucket
  at `backups/daily/YYYY-MM-DDTHH-mm-ss.json`.
- The function has a 300-second (5 minute) timeout.

**To restore from a nightly export:**
```bash
# 1. Download the desired export file
curl -O "https://PROJECT.supabase.co/storage/v1/object/public/backups/backups/daily/2026-06-17T06-00-00.json"

# 2. Extract and import a specific table
cat 2026-06-17T06-00-00.json | jq '.exports[] | select(.table == "organizations") | .rows[]' > orgs.json

# 3. Bulk insert (use with caution — check for conflicts first)
psql "$DATABASE_URL" -c "\copy organizations from 'orgs.json' json"
```

**To set up the `backups` bucket:**
```sql
-- Run this in Supabase SQL Editor once:
insert into storage.buckets (id, name, public) values ('backups', 'backups', false);
```

## 4. Deployment Rollback Procedure (Vercel)

Vercel's instant rollback is always available. Steps:

1. Go to **Vercel Dashboard** -> your project -> **Deployments** tab.
2. Find the last known-good deployment (green checkmark).
3. Click the **"..."** (three dots) menu on that row.
4. Select **"Rollback to this deployment"**.
5. Confirm the rollback. Vercel instantly promotes that deployment to
   production — usually takes 5–15 seconds.
6. If the rollback was caused by a bad database migration, also run the
   corresponding `.down.sql` migration to revert the schema.

**Important:** Vercel rollback reverts *application code only*. If the database
schema was also changed by the bad deploy, the code rollback may fail if the new
code expects the new schema. Always revert the database first, then roll back
the code.

## 5. Migration Rollback Quick Reference

| Migration | File | Down File | What it reverses |
|---|---|---|---|
| 001_schema.sql | Initial schema | `001_schema.down.sql` | Drops ALL tables, types, functions, policies, extension |
| 002_rpc.sql | RPC functions | `002_rpc.down.sql` | Drops 4 stored functions |
| 003_seed_plans.sql | Seed plans | `003_seed_plans.down.sql` | Deletes 3 seeded plan rows |
| 004_approval_system.sql | Approval columns + policy | `004_approval_system.down.sql` | Drops policy, drops `approved_at`/`approved_by` |
| 005_crm_integrations.sql | CRM integrations | `005_crm_integrations.down.sql` | Drops table, type, 3 policies |
| 006_org_status.sql | Status column | `006_org_status.down.sql` | Drops `status` column, reverts `is_active` default |
| 007_config_column.sql | Channel config column | `007_add_config_to_channel_connections.down.sql` | Drops `config` column |
| 008_fix_vector_index.sql | HNSW index | `008_fix_vector_index.down.sql` | Drops HNSW, recreates IVFFlat |

## 6. Backup & Recovery Flowchart

```
                    ┌──────────────────────────┐
                    │  Database issue detected  │
                    └──────────┬───────────────┘
                               │
                    ┌──────────▼───────────────┐
                    │  Is it a schema problem? │
                    │  (bad migration)         │
                    └──────┬──────────┬────────┘
                        Yes│          │No
                    ┌──────▼──┐  ┌────▼───────────┐
                    │  Run    │  │ Application-   │
                    │ down   │  │ level data     │
                    │ migr.  │  │ corruption?    │
                    └───┬────┘  └────┬───────────┘
                        │        Yes│          │No
                    ┌────▼──┐  ┌────▼───┐  ┌───▼────────────┐
                    │       │  │ PITR  │  │ Infrastructure │
                    │ Roll  │  │restore│  │ failure —      │
                    │ back  │  │ to    │  │ Supabase auto- │
                    │ Vercel│  │ before│  │ provisions new │
                    │ deploy│  │ the   │  │ DB from latest │
                    │       │  │ event │  │ backup         │
                    └───────┘  └───────┘  └────────────────┘
```

## 7. Quarterly Restore Test

An untested backup is not a verified backup. Every quarter:

1. Create a temporary Supabase project (or use a staging environment).
2. Restore the latest nightly export into it.
3. Verify row counts match production for all exported tables.
4. Run a smoke test: create a conversation, send a message, verify the AI
   responds.
5. Document the results in a commit message or a brief note (even a single
   comment line is better than nothing).

**Next scheduled test:** 2026-09-01

## 8. Required Environment Variables

| Variable | Purpose |
|---|---|
| `CRON_SECRET` | Shared secret to authenticate Vercel Cron Job calls to `/api/cron/export` |
| `SUPABASE_SERVICE_ROLE_KEY` | Used by the export script to read all tables |

Both must be set in both Vercel and local `.env.local` for the export to work.

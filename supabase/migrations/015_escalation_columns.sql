-- Add missing columns to escalations required by the spec:
--   - status (open/resolved) so PATCH /api/escalations can update resolution state
--   - assigned_to for routing escalations to a human agent
--
-- Existing escalations are backfilled as 'open'.

alter table escalations
  add column if not exists status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved')),
  add column if not exists assigned_to uuid references users(id);

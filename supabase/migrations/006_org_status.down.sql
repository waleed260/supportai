-- Reverse 006_org_status.sql
-- Reverts the `status` column addition and is_active sync.
-- Note: `approved_at` and `approved_by` were added by 004_approval_system.sql,
-- so they are NOT dropped here.

alter table organizations
  drop column if exists status,
  alter column is_active set default true;

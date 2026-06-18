-- Add status tracking to organizations (spec: pending|active|paused|suspended)
alter table organizations
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'active', 'paused', 'suspended')),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references users(id);

-- Migrate existing data from is_active boolean
update organizations set status = 'active'   where is_active = true;
update organizations set status = 'pending'  where is_active = false;

-- Keep is_active in sync via a simple computed view approach;
-- we'll derive it from status in the app layer going forward.
-- For backward compat, sync is_active with status now:
update organizations set is_active = (status = 'active');

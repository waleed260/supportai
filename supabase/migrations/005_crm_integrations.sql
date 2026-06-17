-- CRM and external integrations
create type integration_provider as enum ('hubspot', 'salesforce', 'zoho', 'google_sheets');
create table org_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider integration_provider not null,
  name text,
  is_enabled boolean default false,
  credentials jsonb default '{}',
  settings jsonb default '{}',
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, provider)
);

alter table org_integrations enable row level security;

create policy "integrations_select" on org_integrations for select using (
  organization_id in (select get_user_organizations()) or is_super_admin()
);
create policy "integrations_insert" on org_integrations for insert with check (
  organization_id in (select get_user_organizations())
);
create policy "integrations_update" on org_integrations for update using (
  organization_id in (select get_user_organizations())
);

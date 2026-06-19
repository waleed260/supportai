-- Device tokens for push notifications (Expo push tokens)
create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  expo_push_token text not null,
  platform text not null default 'ios' check (platform in ('ios', 'android')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, expo_push_token)
);

-- Notification preferences
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  escalation_alerts boolean default true,
  usage_alerts boolean default true,
  billing_alerts boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, organization_id)
);

-- Indexes
create index idx_device_tokens_org on device_tokens(organization_id);
create index idx_device_tokens_user on device_tokens(user_id);
create index idx_notification_prefs_user on notification_preferences(user_id, organization_id);

-- RLS
alter table device_tokens enable row level security;
alter table notification_preferences enable row level security;

-- Users can only read/insert their own device tokens
create policy "device_tokens_select" on device_tokens for select using (
  user_id = auth.uid() or is_super_admin()
);
create policy "device_tokens_insert" on device_tokens for insert with check (
  user_id = auth.uid()
);
create policy "device_tokens_update" on device_tokens for update using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);
create policy "device_tokens_delete" on device_tokens for delete using (
  user_id = auth.uid()
);

-- Users can manage their own notification preferences
create policy "notification_prefs_select" on notification_preferences for select using (
  user_id = auth.uid()
);
create policy "notification_prefs_insert" on notification_preferences for insert with check (
  user_id = auth.uid()
);
create policy "notification_prefs_update" on notification_preferences for update using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);
create policy "notification_prefs_upsert" on notification_preferences for all using (
  user_id = auth.uid()
);

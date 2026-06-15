-- Enable pgvector extension
create extension if not exists vector with schema public;

-- Organizations (multi-tenant root)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  website text,
  logo_url text,
  company_size text,
  industry text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Users (platform-wide, can belong to multiple orgs)
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Memberships (RBAC: super_admin, client_admin, team_member)
create type membership_role as enum ('super_admin', 'client_admin', 'team_member');
create table memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role membership_role not null default 'team_member',
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id, organization_id)
);

-- Subscription plans
create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- Starter, Growth, Pro
  slug text unique not null,
  description text,
  price_monthly integer not null, -- in cents
  price_yearly integer not null,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  max_conversations integer not null default 500,
  max_seats integer not null default 1,
  max_knowledge_docs integer default 10,
  channels text[] default array['web_chat'],
  features jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Subscriptions
create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired');
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  stripe_subscription_id text,
  stripe_customer_id text,
  status subscription_status default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  billing_interval text default 'month', -- month or year
  trial_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI Agents (one per organization)
create table ai_agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null default 'SupportAI Agent',
  personality text default 'professional',
  tone_of_voice text default 'friendly',
  brand_guidelines text,
  custom_instructions text,
  model text default 'claude-sonnet-5-20250101',
  temperature numeric default 0.7,
  is_active boolean default true,
  lead_capture_enabled boolean default false,
  sales_mode_enabled boolean default false,
  sentiment_analysis_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge sources
create type knowledge_source_type as enum ('pdf', 'docx', 'txt', 'website', 'faq', 'product_catalog');
create type processing_status as enum ('pending', 'processing', 'completed', 'failed');
create table knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type knowledge_source_type not null,
  file_path text,
  source_url text,
  status processing_status default 'pending',
  error_message text,
  chunk_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Document chunks with embeddings
create table documents (
  id uuid primary key default gen_random_uuid(),
  knowledge_source_id uuid not null references knowledge_sources(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(1024),
  created_at timestamptz default now()
);

-- Conversations
create type conversation_status as enum ('active', 'waiting', 'resolved', 'escalated');
create type conversation_channel as enum ('web_chat', 'whatsapp', 'instagram', 'facebook', 'telegram', 'email');
create type sentiment_label as enum ('positive', 'neutral', 'negative', 'frustrated', 'high_risk');
create table conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  channel conversation_channel not null default 'web_chat',
  channel_conversation_id text, -- external platform conversation ID
  customer_name text,
  customer_email text,
  customer_phone text,
  status conversation_status default 'active',
  sentiment sentiment_label default 'neutral',
  lead_status text, -- hot, warm, cold, converted
  assigned_to uuid references users(id),
  escalated_to uuid references users(id),
  escalation_reason text,
  is_sales_mode boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('customer', 'assistant', 'agent', 'system')),
  content text not null,
  sentiment sentiment_label,
  confidence_score numeric,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  conversation_id uuid references conversations(id),
  name text,
  email text,
  phone text,
  product_interest text,
  budget text,
  source text,
  status text default 'new',
  assigned_to uuid references users(id),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Escalations
create table escalations (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  triggered_by text not null, -- 'sentiment', 'low_confidence', 'keyword', 'user_request'
  reason text,
  conversation_summary text,
  issue_summary text,
  resolved_by uuid references users(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- Channel connections (OAuth tokens for WhatsApp, Instagram, Facebook)
create table channel_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  channel conversation_channel not null,
  name text,
  is_connected boolean default false,
  credentials jsonb default '{}', -- encrypted
  webhook_url text,
  webhook_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, channel)
);

-- Analytics events
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}',
  created_at timestamptz default now()
);

-- Audit logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  user_id uuid references users(id),
  action text not null,
  resource_type text,
  resource_id text,
  details jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

-- Web chat widget settings
create table widget_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text default 'Chat with us',
  welcome_message text default 'Hi! How can we help you today?',
  primary_color text default '#2563eb',
  position text default 'right',
  show_branding boolean default true,
  custom_css text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_memberships_user on memberships(user_id);
create index idx_memberships_org on memberships(organization_id);
create index idx_conversations_org on conversations(organization_id);
create index idx_conversations_status on conversations(status);
create index idx_messages_conversation on messages(conversation_id);
create index idx_documents_org on documents(organization_id);
create index idx_documents_embedding on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_analytics_events_org on analytics_events(organization_id);
create index idx_analytics_events_type on analytics_events(event_type);
create index idx_analytics_events_created on analytics_events(created_at);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table users enable row level security;
alter table memberships enable row level security;
alter table subscriptions enable row level security;
alter table subscription_plans enable row level security;
alter table ai_agents enable row level security;
alter table knowledge_sources enable row level security;
alter table documents enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;
alter table escalations enable row level security;
alter table channel_connections enable row level security;
alter table analytics_events enable row level security;
alter table audit_logs enable row level security;
alter table widget_settings enable row level security;

-- RLS Policies: users can only access their own organization's data

-- Organizations: super_admin sees all, others see own
create policy "org_select" on organizations for select using (
  auth.uid() in (select user_id from memberships where organization_id = id)
  or auth.uid() in (select user_id from memberships where role = 'super_admin')
);

-- Memberships: users see their own
create policy "memberships_select" on memberships for select using (
  user_id = auth.uid()
  or auth.uid() in (select user_id from memberships m2 where m2.role = 'super_admin')
);

-- Helper function to get user's organization ids
create or replace function get_user_organizations()
returns setof uuid
language sql stable
as $$
  select organization_id from memberships where user_id = auth.uid() and is_active = true;
$$;

-- Helper function to check if user is super admin
create or replace function is_super_admin()
returns boolean
language sql stable
as $$
  select exists(select 1 from memberships where user_id = auth.uid() and role = 'super_admin');
$$;

-- RLS for conversations (example pattern used by all org-scoped tables)
create policy "conversations_select" on conversations for select using (
  organization_id in (select get_user_organizations())
  or is_super_admin()
);
create policy "conversations_insert" on conversations for insert with check (
  organization_id in (select get_user_organizations())
  or is_super_admin()
);
create policy "conversations_update" on conversations for update using (
  organization_id in (select get_user_organizations())
  or is_super_admin()
);

-- Seed default subscription plans
insert into subscription_plans (name, slug, description, price_monthly, price_yearly, max_conversations, max_seats, max_knowledge_docs, channels, features) values
('Starter', 'starter', 'Basic AI customer support for small businesses', 2900, 29000, 500, 1, 5, array['web_chat', 'whatsapp'], jsonb_build_object('lead_capture', false, 'sentiment_analysis', false, 'advanced_analytics', false, 'priority_support', false)),
('Growth', 'growth', 'Multi-channel support with lead capture', 9900, 99000, 2000, 3, 20, array['web_chat', 'whatsapp', 'instagram', 'facebook'], jsonb_build_object('lead_capture', true, 'sentiment_analysis', true, 'advanced_analytics', false, 'priority_support', false)),
('Pro', 'pro', 'Enterprise AI with full feature access', 29900, 299000, 10000, 50, 100, array['web_chat', 'whatsapp', 'instagram', 'facebook', 'telegram', 'email'], jsonb_build_object('lead_capture', true, 'sentiment_analysis', true, 'advanced_analytics', true, 'priority_support', true));

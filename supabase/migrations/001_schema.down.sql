-- Reverse 001_schema.sql
-- WARNING: This drops ALL tables, types, functions, and extensions created
-- by the initial schema. Data loss is total. Only use when restoring from
-- scratch or rolling back a fresh deploy.

drop policy if exists "conversations_update" on conversations;
drop policy if exists "conversations_insert" on conversations;
drop policy if exists "conversations_select" on conversations;
drop policy if exists "memberships_select" on memberships;
drop policy if exists "org_select" on organizations;

drop function if exists is_super_admin;
drop function if exists get_user_organizations;

drop table if exists widget_settings;
drop table if exists audit_logs;
drop table if exists analytics_events;
drop table if exists channel_connections;
drop table if exists escalations;
drop table if exists leads;
drop table if exists messages;
drop table if exists conversations;
drop table if exists documents;
drop table if exists knowledge_sources;
drop table if exists ai_agents;
drop table if exists subscriptions;
drop table if exists subscription_plans;
drop table if exists memberships;
drop table if exists users;
drop table if exists organizations;

drop type if exists processing_status;
drop type if exists sentiment_label;
drop type if exists conversation_channel;
drop type if exists conversation_status;
drop type if exists subscription_status;
drop type if exists membership_role;
drop type if exists knowledge_source_type;

drop extension if exists vector;

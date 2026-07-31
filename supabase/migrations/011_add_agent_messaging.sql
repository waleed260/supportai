alter table ai_agents add column if not exists welcome_message text default null;
alter table ai_agents add column if not exists fallback_message text default null;
alter table ai_agents add column if not exists language_mode text default 'auto';

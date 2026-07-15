drop index if exists idx_conversations_language;
alter table conversations drop column if exists language;

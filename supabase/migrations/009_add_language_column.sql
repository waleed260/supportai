alter table conversations add column if not exists language text default null;

create index if not exists idx_conversations_language on conversations (language);

-- Reverse 002_rpc.sql

drop function if exists match_documents(vector(1024), float, int, uuid);
drop function if exists get_conversation_history(uuid);
drop function if exists get_conversations_by_day(uuid, int);
drop function if exists get_sentiment_breakdown(uuid);

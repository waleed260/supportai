-- Match documents via cosine similarity
create or replace function match_documents(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  p_organization_id uuid
)
returns table (
  id uuid,
  content text,
  knowledge_source_id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.knowledge_source_id,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where
    documents.organization_id = p_organization_id
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Get conversation history
create or replace function get_conversation_history(p_conversation_id uuid)
returns table (
  role text,
  content text,
  created_at timestamptz
)
language sql
as $$
  select role, content, created_at
  from messages
  where conversation_id = p_conversation_id
  order by created_at asc
  limit 50;
$$;

-- Analytics: conversation counts by day
create or replace function get_conversations_by_day(
  p_organization_id uuid,
  p_days int default 30
)
returns table (
  date date,
  count bigint
)
language sql
as $$
  select
    date_trunc('day', created_at)::date as date,
    count(*)::bigint as count
  from conversations
  where organization_id = p_organization_id
    and created_at >= now() - (p_days || ' days')::interval
  group by 1
  order by 1;
$$;

-- Analytics: sentiment breakdown
create or replace function get_sentiment_breakdown(p_organization_id uuid)
returns table (
  sentiment text,
  count bigint
)
language sql
as $$
  select sentiment::text, count(*)::bigint
  from conversations
  where organization_id = p_organization_id
  group by sentiment;
$$;

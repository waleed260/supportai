-- Reverse 014_embedding_dimensions.sql
-- Downgrading back to 1024 is only safe if embeddings are re-generated at 1024.

drop index if exists idx_documents_embedding;

alter table documents drop column if exists embedding;
alter table documents add column embedding vector(1024);

create index idx_documents_embedding on documents
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 200);

delete from documents;

update knowledge_sources
set status = 'pending', chunk_count = 0
where status in ('processing', 'completed', 'failed');

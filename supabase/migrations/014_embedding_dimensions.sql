-- Upgrade document embeddings from 1024 to 1536 dimensions to match the spec
-- (OpenAI text-embedding-3-small native dimensionality).
--
-- Postgres cannot cast an existing vector(1024) value to vector(1536) at the
-- data level (pgvector validates the element count), so the existing column is
-- dropped and recreated. Any previously embedded chunks are discarded and their
-- knowledge sources are reset to 'pending' so they are re-processed by
-- /api/knowledge/process with fresh 1536-dim embeddings.
--
-- Fresh installs already get vector(1536) from 001_schema.sql and are unaffected.

drop index if exists idx_documents_embedding;

alter table documents drop column if exists embedding;
alter table documents add column embedding vector(1536);

create index idx_documents_embedding on documents
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 200);

delete from documents;

update knowledge_sources
set status = 'pending', chunk_count = 0
where status in ('processing', 'completed', 'failed');

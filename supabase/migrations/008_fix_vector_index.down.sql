-- Reverse 008_fix_vector_index.sql
-- Restore the original IVFFlat index from 001_schema.sql.
-- HNSW is dropped first, then IVFFlat is rebuilt.
-- Note: IVFFlat requires a training step; on an empty or small table
-- the centroids will be meaningless until the index is rebuilt after
-- a representative data volume is loaded.

drop index if exists idx_documents_embedding;

create index idx_documents_embedding on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

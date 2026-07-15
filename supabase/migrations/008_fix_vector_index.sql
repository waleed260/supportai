-- Replace the IVFFlat embedding index with HNSW for better quality
--
-- The original ivfflat index was built on an empty table during initial
-- schema setup (001_schema.sql), producing meaningless cluster centroids
-- that degrade similarity search relevance. HNSW is chosen because:
--   1. No training step required — works correctly on data inserted
--      after index creation
--   2. Better recall@k at this scale (tables under ~5M rows)
--   3. Safe to build on a table that already has live data
--
-- If the documents table later grows past ~5M rows, re-evaluate:
--   - IVFFlat with proper training on representative data
--   - DiskANN (PostgreSQL 17+ via pg_diskann extension)
--   - pgvector's streaming clustering for IVFFlat

drop index if exists idx_documents_embedding;

create index idx_documents_embedding on documents
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 200);

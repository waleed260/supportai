# Migration & Maintenance Notes

## Known Follow-Up Work

### Table Growth & Archival

The following tables are expected to grow unbounded and should be archived or
partitioned once they exceed a few million rows:

| Table | Growth Rate | Suggested Approach |
|---|---|---|
| `analytics_events` | High (one row per webhook/chat event) | Monthly `LIST` partitioning by `created_at`, or scheduled `DELETE` + cold-storage export via `pg_cron` |
| `messages` | High (one row per chat turn) | Monthly range partitioning by `created_at`; queries almost always filter by `conversation_id` so partition pruning remains effective |

**Recommended implementation (when needed):**

1. Enable `pg_partman` extension for automated partition management.
2. Create monthly partitions with a retention policy (e.g., drop partitions older
   than 12 months or move them to a separate archived schema).
3. For cold storage: schedule a nightly `pg_cron` job that copies rows older
   than N months to Parquet files (via `pg_parquet` or a custom ETL) and
   `DELETE`s them from the live table.
4. Add a `created_at` index on both tables today (if not present) to make the
   future partitioning migration faster — `CREATE INDEX CONCURRENTLY` to avoid
   production downtime.

### Vector Index Re-Evaluation

The `documents.embedding` index uses HNSW (`m = 16`, `ef_construction = 200`),
which works well up to ~5M rows. If the documents table grows past that
threshold, re-evaluate:

- **IVFFlat** with a properly trained centroid list (`lists` parameter) on
  representative data — requires rebuilding the index periodically as the
  corpus grows.
- **DiskANN** (PostgreSQL 17+ via `pg_diskann`) for disk-optimized approximate
  nearest neighbor search on very large datasets.

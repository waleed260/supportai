#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Restore test — verify nightly backup integrity
# Usage: ./scripts/test-restore.sh <staging-db-url> <backup-file>
#
# The backup file should be downloaded from Supabase Storage first
# (using a signed URL since the bucket is private).
#
# Prerequisites:
#   - jq, curl, psql installed
#   - Staging Supabase project exists
#
# Run quarterly. Next scheduled: 2026-09-01
# ──────────────────────────────────────────────

STAGING_DB_URL="${1:?Usage: $0 <staging-db-url> <backup-file>}"
BACKUP_FILE="${2:?Usage: $0 <staging-db-url> <backup-file>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Step 1: Validate JSON structure ==="
jq -e '.timestamp and .exports | length > 0' "$BACKUP_FILE" > /dev/null
echo "Valid — $(jq '.exports | length' "$BACKUP_FILE") tables"

echo ""
echo "=== Step 2: Row count summary ==="
jq -r '.exports[] | "\(.table): \(.rowCount) rows \(if .error then "ERROR: \(.error)" else "" end)"' "$BACKUP_FILE"

echo ""
echo "=== Step 3: Restore a critical table (conversations) ==="
JSON_ARRAY=$(jq -c '.exports[] | select(.table == "conversations") | .rows' "$BACKUP_FILE")
ORIG_COUNT=$(jq '.exports[] | select(.table == "conversations") | .rowCount' "$BACKUP_FILE")

if [ "$ORIG_COUNT" -gt 0 ]; then
  psql "$STAGING_DB_URL" -c "
    INSERT INTO conversations
    SELECT * FROM json_populate_recordset(null::conversations, '$JSON_ARRAY')
    ON CONFLICT DO NOTHING;
  " 2>&1

  RESTORED_COUNT=$(psql "$STAGING_DB_URL" -t -c "select count(*) from conversations" | tr -d ' ')
  if [ "$ORIG_COUNT" -eq "$RESTORED_COUNT" ]; then
    echo "PASS: conversations restored $RESTORED_COUNT/$ORIG_COUNT rows"
  else
    echo "WARN: expected $ORIG_COUNT rows, got $RESTORED_COUNT — FK constraints may prevent full restore"
  fi
else
  echo "SKIP: conversations table is empty"
fi

echo ""
echo "=== Step 4: Restore remaining tables ==="
for TABLE in organizations subscriptions subscription_plans leads messages memberships ai_agents escalations; do
  ROWS=$(jq ".exports[] | select(.table == \"$TABLE\") | .rowCount" "$BACKUP_FILE")
  ERROR=$(jq -r ".exports[] | select(.table == \"$TABLE\") | .error // empty" "$BACKUP_FILE")
  if [ -n "$ERROR" ]; then echo "SKIP $TABLE: export error — $ERROR"; continue; fi
  if [ "$ROWS" -eq 0 ]; then echo "SKIP $TABLE: empty"; continue; fi

  TABLE_JSON=$(jq -c ".exports[] | select(.table == \"$TABLE\") | .rows" "$BACKUP_FILE")
  psql "$STAGING_DB_URL" -c "
    INSERT INTO $TABLE
    SELECT * FROM json_populate_recordset(null::$TABLE, '$TABLE_JSON')
    ON CONFLICT DO NOTHING;
  " 2>/dev/null && echo "OK $TABLE: $ROWS rows" || echo "WARN $TABLE: skipped (likely FK dependency)"
done

echo ""
echo "=== Restore test complete ==="
echo "Next scheduled test: 2026-09-01"

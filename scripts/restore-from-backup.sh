#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────
# Restore from nightly JSON export
#
# Usage:
#   ./scripts/restore-from-backup.sh <backup-file> <db-url>
#
# The backup file is expected at:
#   supabase/storage/v1/object/authenticated/backups/backups/daily/<timestamp>.json
#
# Use a signed URL or pass the file path directly.
# ──────────────────────────────────────────────────────

BACKUP_FILE="${1:?Usage: $0 <backup-file> <db-url>}"
DB_URL="${2:?Usage: $0 <backup-file> <db-url>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Restoring from: $BACKUP_FILE ==="

# 1. Validate JSON
jq -e '.timestamp and .exports | length > 0' "$BACKUP_FILE" > /dev/null
echo "Valid backup — $(jq '.exports | length' "$BACKUP_FILE") tables"

# 2. Show row counts
jq -r '.exports[] | "\(.table): \(.rowCount) rows \(if .error then "ERROR: \(.error)" else "" end)"' "$BACKUP_FILE"

# 3. Restore in dependency order (FK-safe)
for TABLE in organizations subscription_plans users memberships ai_agents subscriptions leads conversations widget_settings; do
  ROWS=$(jq ".exports[] | select(.table == \"$TABLE\") | .rowCount" "$BACKUP_FILE")
  ERROR=$(jq -r ".exports[] | select(.table == \"$TABLE\") | .error // empty" "$BACKUP_FILE")
  [ -n "$ERROR" ] && { echo "SKIP $TABLE: export error — $ERROR"; continue; }
  [ "$ROWS" -eq 0 ] && { echo "SKIP $TABLE: empty"; continue; }

  # Extract rows as a JSON array and use json_populate_recordset
  psql "$DB_URL" -v ON_ERROR_STOP=1 -q -c "
    CREATE TEMP TABLE tmp_${TABLE} AS
    SELECT * FROM json_populate_recordset(null::${TABLE}, '$(jq -c ".exports[] | select(.table == \"$TABLE\") | .rows" "$BACKUP_FILE")');
    INSERT INTO ${TABLE} SELECT * FROM tmp_${TABLE}
    ON CONFLICT DO NOTHING;
  " 2>/dev/null && echo "OK $TABLE: $ROWS rows restored" || echo "WARN $TABLE: restore failed (likely FK or schema issue)"
done

echo ""
echo "=== Restore complete ==="

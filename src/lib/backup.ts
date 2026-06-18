import { createServiceRoleClient } from '@/lib/supabase/server'

export type ExportTable =
  | 'organizations'
  | 'subscriptions'
  | 'leads'
  | 'conversations'
  | 'messages'
  | 'memberships'
  | 'ai_agents'
  | 'subscription_plans'
  | 'escalations'

const EXPORT_TABLES: ExportTable[] = [
  'organizations',
  'subscriptions',
  'subscription_plans',
  'leads',
  'conversations',
  'messages',
  'memberships',
  'ai_agents',
  'escalations',
]

type TableExport = {
  table: ExportTable
  rows: unknown[]
  error?: string
}

export type BackupResult = {
  timestamp: string
  exports: { table: ExportTable; rowCount: number; error?: string }[]
  storagePath?: string
  storageError?: string
}

export async function exportAllTables(): Promise<BackupResult> {
  const supabase = await createServiceRoleClient()
  const timestamp = new Date().toISOString()
  const exports: TableExport[] = []

  for (const table of EXPORT_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        exports.push({ table, rows: [], error: error.message })
        continue
      }
      exports.push({ table, rows: data ?? [] })
    } catch (err) {
      exports.push({
        table,
        rows: [],
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const dateLabel = timestamp.replace(/[:.]/g, '-').slice(0, 19)
  const fileName = `backups/daily/${dateLabel}.json`
  const payload = JSON.stringify({ timestamp, exports: exports.map(e => ({ table: e.table, rows: e.rows, error: e.error })) }, null, 2)

  const { error: uploadError } = await supabase.storage
    .from('backups')
    .upload(fileName, payload, { contentType: 'application/json', upsert: true })

  const result: BackupResult = {
    timestamp,
    exports: exports.map(e => ({ table: e.table, rowCount: e.rows.length, error: e.error })),
  }

  if (uploadError) {
    result.storageError = uploadError.message
  } else {
    result.storagePath = fileName
  }

  return result
}

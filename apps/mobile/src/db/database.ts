import * as SQLite from 'expo-sqlite'
import { tables } from './schema'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync('supportai.db')
  await initializeSchema()
  return db
}

async function initializeSchema() {
  if (!db) return
  for (const statement of tables) {
    await db.runAsync(statement)
  }
}

export async function closeDatabase() {
  if (db) {
    await db.closeAsync()
    db = null
  }
}

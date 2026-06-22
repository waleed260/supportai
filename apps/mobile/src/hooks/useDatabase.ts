import { useState, useEffect } from 'react'
import { getDatabase } from '../db/database'
import type { SQLiteDatabase } from 'expo-sqlite'

export function useDatabase() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getDatabase()
      .then(setDb)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  return { db, isLoading, error }
}

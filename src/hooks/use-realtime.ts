import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  schema = 'public',
  callback,
  deps = [],
}: {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  schema?: string
  callback: (payload: any) => void
  deps?: any[]
}) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const supabase = createClient()
    const channelName = `${table}-${event}-${filter || 'all'}`

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event, schema, table, filter } as any, (payload: any) => {
        callbackRef.current(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, filter, schema, ...deps])
}

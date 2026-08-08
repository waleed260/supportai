'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload, RealtimePostgresChangesFilter } from '@supabase/supabase-js'

type RealtimeRow = { [key: string]: unknown }

interface UseRealtimeSubscriptionOptions {
  table: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  callback: (payload: RealtimePostgresChangesPayload<RealtimeRow>) => void
  deps?: unknown[]
}

export function useRealtimeSubscription({
  table,
  filter,
  event = '*',
  callback,
  deps = [],
}: UseRealtimeSubscriptionOptions) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const supabase = createClient()

    const channelConfig = {
      event,
      schema: 'public',
      table,
      ...(filter ? { filter } : {}),
    } as RealtimePostgresChangesFilter<'*'>

    const channel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        channelConfig,
        (payload) => {
          callbackRef.current(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, event, ...deps])
}

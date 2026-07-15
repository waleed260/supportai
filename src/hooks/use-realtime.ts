'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimeSubscriptionOptions {
  table: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
  deps?: any[]
}

export function useRealtimeSubscription({
  table,
  filter,
  event = '*',
  callback,
  deps = [],
}: UseRealtimeSubscriptionOptions) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const supabase = createClient()

    const channelConfig: any = {
      event,
      schema: 'public',
      table,
    }

    if (filter) {
      channelConfig.filter = filter
    }

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

import { useEffect, useCallback, type DependencyList } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  table: string,
  filter: string | undefined,
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void,
  deps: DependencyList = [],
) {
  const callback = useCallback(onPayload, deps)

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on<T>(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => callback(payload),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, callback])
}

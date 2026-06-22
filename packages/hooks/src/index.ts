import { useEffect, useCallback, useRef, type DependencyList } from 'react'
import type { RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js'

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  filter: string | undefined,
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void,
  deps: DependencyList = [],
) {
  const callback = useCallback(onPayload, deps)

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${filter ?? 'all'}`)
      .on<T>(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => callback(payload),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, table, filter, callback])
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => { ref.current = value }, [value])
  return ref.current
}

export function useIsMounted(): { current: boolean } {
  const isMounted = useRef(true)
  useEffect(() => {
    return () => { isMounted.current = false }
  }, [])
  return isMounted
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

import React from 'react'

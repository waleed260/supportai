'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Returns false during SSR and the first client render, true thereafter.
 * Uses useSyncExternalStore so there is no setState-in-effect — the value is
 * derived from server/client snapshots directly.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  )
}

import { syncQueueRepo, conversationRepo, messageRepo, leadRepo, escalationRepo } from '../repository'
import { useSyncStore } from '../../stores/syncStore'
import type { Conversation, Message } from '@supportai/types'

interface SyncConfig {
  baseUrl: string
  getToken: () => Promise<string | null>
  orgId: string
}

export function createSyncEngine(config: SyncConfig) {
  const store = useSyncStore.getState()

  async function processQueue() {
    if (store.isSyncing) return
    useSyncStore.getState().setIsSyncing(true)

    try {
      const pending = await syncQueueRepo.getPending()
      for (const op of pending) {
        try {
          const token = await config.getToken()
          const res = await fetch(`${config.baseUrl}/${op.table}`, {
            method: op.operation === 'delete' ? 'DELETE' : op.operation === 'create' ? 'POST' : 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: op.operation !== 'delete' ? JSON.stringify(op.payload) : undefined,
          })
          if (!res.ok) throw new Error(`Sync failed: ${res.status}`)
          await syncQueueRepo.markCompleted(op.id)
        } catch (err) {
          await syncQueueRepo.markFailed(op.id, (err as Error).message)
          if (op.retry_count >= 3) {
            useSyncStore.getState().setNetworkStatus('poor')
          }
        }
      }
      useSyncStore.getState().setLastSyncTimestamp(new Date().toISOString())
    } finally {
      useSyncStore.getState().setIsSyncing(false)
    }
  }

  async function syncConversations(conversations: Conversation[]) {
    await conversationRepo.upsertMany(conversations)
    useSyncStore.getState().setLastSyncTimestamp(new Date().toISOString())
  }

  async function syncMessages(messages: Message[]) {
    await messageRepo.upsertMany(messages)
  }

  async function queueOfflineCreate(table: string, recordId: string, payload: Record<string, unknown>) {
    await syncQueueRepo.push({
      operation: 'create',
      table,
      record_id: recordId,
      payload,
    })
  }

  async function queueOfflineUpdate(table: string, recordId: string, payload: Record<string, unknown>) {
    await syncQueueRepo.push({
      operation: 'update',
      table,
      record_id: recordId,
      payload,
    })
  }

  async function getPendingCount(): Promise<number> {
    const pending = await syncQueueRepo.getPending()
    return pending.length
  }

  async function cleanup() {
    await syncQueueRepo.removeCompleted()
  }

  return {
    processQueue,
    syncConversations,
    syncMessages,
    queueOfflineCreate,
    queueOfflineUpdate,
    getPendingCount,
    cleanup,
  }
}

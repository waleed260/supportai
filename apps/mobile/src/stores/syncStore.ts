import { create } from 'zustand'

interface SyncOperation {
  id: string
  table: string
  recordId: string
  operation: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  status: 'pending' | 'processing' | 'failed' | 'completed'
  retryCount: number
  error?: string
  createdAt: string
}

interface SyncStore {
  isSyncing: boolean
  lastSyncTimestamp: string | null
  pendingOperations: SyncOperation[]
  failedOperations: SyncOperation[]
  networkStatus: 'online' | 'offline' | 'poor'
  setIsSyncing: (isSyncing: boolean) => void
  setLastSyncTimestamp: (timestamp: string) => void
  addOperation: (op: SyncOperation) => void
  updateOperation: (id: string, updates: Partial<SyncOperation>) => void
  removeOperation: (id: string) => void
  setNetworkStatus: (status: SyncStore['networkStatus']) => void
}

export const useSyncStore = create<SyncStore>((set) => ({
  isSyncing: false,
  lastSyncTimestamp: null,
  pendingOperations: [],
  failedOperations: [],
  networkStatus: 'online',
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncTimestamp: (lastSyncTimestamp) => set({ lastSyncTimestamp }),
  addOperation: (op) => set((s) => ({
    pendingOperations: [...s.pendingOperations, op],
  })),
  updateOperation: (id, updates) => set((s) => ({
    pendingOperations: s.pendingOperations.map((op) =>
      op.id === id ? { ...op, ...updates } : op
    ),
    failedOperations: updates.status === 'failed'
      ? [...s.failedOperations, { ...s.pendingOperations.find(o => o.id === id)!, ...updates }]
      : s.failedOperations,
  })),
  removeOperation: (id) => set((s) => ({
    pendingOperations: s.pendingOperations.filter((op) => op.id !== id),
  })),
  setNetworkStatus: (networkStatus) => set({ networkStatus }),
}))

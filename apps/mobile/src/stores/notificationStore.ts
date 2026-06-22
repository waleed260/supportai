import { create } from 'zustand'
import type { NotificationPreferences, NotificationType } from '@supportai/types'

interface NotificationStore {
  expoPushToken: string | null
  preferences: NotificationPreferences
  pendingNotifications: Array<{
    id: string
    type: NotificationType
    title: string
    body: string
    data?: Record<string, unknown>
    receivedAt: string
  }>
  setExpoPushToken: (token: string | null) => void
  setPreferences: (prefs: NotificationPreferences) => void
  addPendingNotification: (notification: NotificationStore['pendingNotifications'][0]) => void
  clearPendingNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  expoPushToken: null,
  preferences: {
    escalation_alerts: true,
    message_alerts: true,
    lead_alerts: true,
    billing_alerts: true,
    system_alerts: true,
    mention_alerts: true,
  },
  pendingNotifications: [],
  setExpoPushToken: (expoPushToken) => set({ expoPushToken }),
  setPreferences: (preferences) => set({ preferences }),
  addPendingNotification: (notification) => set((s) => ({
    pendingNotifications: [...s.pendingNotifications, notification],
  })),
  clearPendingNotifications: () => set({ pendingNotifications: [] }),
}))

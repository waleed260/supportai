import { useEffect, useRef, useState, useCallback } from 'react'
import * as Notifications from 'expo-notifications'
import { useAuth } from './useAuth'
import { registerForPushNotificationsAsync, fetchNotificationPreferences } from '../lib/notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function useNotifications() {
  const { user, organizationId } = useAuth()
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [preferences, setPreferences] = useState({
    escalation_alerts: true,
    usage_alerts: true,
    billing_alerts: true,
  })
  const notificationListener = useRef<{ remove: () => void } | null>(null)
  const responseListener = useRef<{ remove: () => void } | null>(null)

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data
  }, [])

  useEffect(() => {
    if (!user?.id || !organizationId) return

    registerForPushNotificationsAsync(organizationId).then(setExpoPushToken)
    fetchNotificationPreferences(organizationId).then(setPreferences)

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification.request.content.title)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse)

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [user?.id, organizationId, handleNotificationResponse])

  return { expoPushToken, preferences, setPreferences }
}

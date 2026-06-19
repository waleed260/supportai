import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { api } from './api'

export async function registerForPushNotificationsAsync(organizationId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted')
    return null
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  if (!projectId) {
    console.warn('No EAS project ID configured')
    return null
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
  const pushToken = tokenData.data

  try {
    await api.registerDeviceToken(pushToken, Platform.OS, organizationId)
  } catch (error) {
    console.error('Failed to register device token with server:', error)
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return pushToken
}

export async function fetchNotificationPreferences(orgId: string) {
  try {
    const data = await api.fetchNotificationPreferences(orgId)
    return data.preferences
  } catch {
    return { escalation_alerts: true, usage_alerts: true, billing_alerts: true }
  }
}

export async function updateNotificationPreferences(
  orgId: string,
  prefs: { escalation_alerts?: boolean; usage_alerts?: boolean; billing_alerts?: boolean }
) {
  return api.updateNotificationPreferences(orgId, prefs)
}

export function getNotificationData(notification: Notifications.Notification) {
  return notification.request.content.data as {
    type?: string
    conversation_id?: string
    escalation_id?: string
    organization_id?: string
    [key: string]: unknown
  }
}

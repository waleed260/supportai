import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLastNotificationResponse } from 'expo-notifications'

export function useNotificationHandler() {
  const navigation = useNavigation<any>()
  const lastResponse = useLastNotificationResponse()

  useEffect(() => {
    if (lastResponse) {
      const data = lastResponse.notification.request.content.data as Record<string, unknown> | undefined
      if (data?.conversation_id) {
        setTimeout(() => {
          navigation.navigate('ConversationDetail', {
            id: String(data.conversation_id),
          })
        }, 500)
      }
    }
  }, [lastResponse, navigation])
}

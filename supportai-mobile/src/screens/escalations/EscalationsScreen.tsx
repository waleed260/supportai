import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import type { Escalation } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  dismissed: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

export default function EscalationsScreen({ navigation }: { navigation: any }) {
  const { organizationId } = useAuth()
  const queryClient = useQueryClient()

  const { data: escalations, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['escalations', organizationId],
    queryFn: () => api.getEscalations(organizationId!),
    enabled: !!organizationId,
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.resolveEscalation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations', organizationId] })
    },
  })

  const openConversation = (escalation: Escalation) => {
    navigation.navigate('ConversationDetail', { id: escalation.conversation_id })
  }

  const renderItem = ({ item }: { item: Escalation }) => {
    const statusStyle = STATUS_COLORS[item.status || 'open'] || STATUS_COLORS.open
    const [bg, text] = statusStyle.split(' ')
    return (
      <TouchableOpacity
        className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700"
        onPress={() => openConversation(item)}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-gray-900 flex-1 dark:text-gray-100" numberOfLines={1}>
            {item.reason || item.issue_summary || 'Escalation'}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${bg}`}>
            <Text className={`text-xs font-medium ${text}`}>
              {(item.status || 'open').toUpperCase()}
            </Text>
          </View>
        </View>
        {item.conversation_summary && (
          <Text className="text-sm text-gray-500 mb-2 dark:text-gray-400" numberOfLines={2}>
            {item.conversation_summary}
          </Text>
        )}
        {item.issue_summary && (
          <Text className="text-sm text-gray-500 mb-2 dark:text-gray-400" numberOfLines={2}>
            {item.issue_summary}
          </Text>
        )}
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(item.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-400 mt-3 dark:text-gray-500">Loading escalations...</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-gray-500 text-base text-center dark:text-gray-400">Failed to load escalations</Text>
        <Text className="text-gray-400 text-sm mt-1 text-center dark:text-gray-500">{(error as Error)?.message || 'Check your connection'}</Text>
        <TouchableOpacity className="bg-primary px-6 py-2.5 rounded-xl mt-4" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlashList
        data={escalations || []}
        keyExtractor={(item: Escalation) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center pt-20">
            <Text className="text-4xl mb-3">✅</Text>
            <Text className="text-gray-400 text-base dark:text-gray-500">No escalations</Text>
            <Text className="text-gray-400 text-sm mt-1 dark:text-gray-500">All conversations are running smoothly</Text>
          </View>
        }
      />
    </View>
  )
}

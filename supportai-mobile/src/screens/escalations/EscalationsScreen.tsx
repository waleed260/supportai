import { View, Text, TouchableOpacity, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import type { Escalation } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-500',
}

export default function EscalationsScreen({ navigation }: { navigation: any }) {
  const { organizationId } = useAuth()
  const queryClient = useQueryClient()

  const { data: escalations, isLoading, refetch, isRefetching } = useQuery({
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
    return (
      <TouchableOpacity
        className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100 shadow-sm"
        onPress={() => openConversation(item)}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-gray-900 flex-1" numberOfLines={1}>
            {item.reason || item.issue_summary || 'Escalation'}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${statusStyle.split(' ')[0]}`}>
            <Text className={`text-xs font-medium ${statusStyle.split(' ')[1]}`}>
              {(item.status || 'open').toUpperCase()}
            </Text>
          </View>
        </View>
        {item.conversation_summary && (
          <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
            {item.conversation_summary}
          </Text>
        )}
        {item.issue_summary && (
          <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
            {item.issue_summary}
          </Text>
        )}
        <Text className="text-xs text-gray-400">
          {new Date(item.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-400">Loading escalations...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlashList
        data={escalations || []}
        keyExtractor={(item: Escalation) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center pt-20">
            <Text className="text-4xl mb-3">✅</Text>
            <Text className="text-gray-400 text-base">No escalations</Text>
            <Text className="text-gray-400 text-sm mt-1">All conversations are running smoothly</Text>
          </View>
        }
      />
    </View>
  )
}

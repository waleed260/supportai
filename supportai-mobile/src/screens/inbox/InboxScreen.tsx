import { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import { useRealtimeSubscription } from '../../hooks/useRealtime'
import type { Conversation, ConversationChannel, ConversationStatus } from '../../types'

const channelColors: Record<ConversationChannel, string> = {
  web_chat: '#3b82f6', whatsapp: '#25D366', instagram: '#E4405F',
  facebook: '#1877F2', telegram: '#0088cc', email: '#ea580c',
}
const sentimentColors: Record<string, string> = {
  positive: '#22c55e', neutral: '#94a3b8', negative: '#f59e0b',
  frustrated: '#ef4444', high_risk: '#dc2626',
}
const channelLabels: Record<ConversationChannel, string> = {
  web_chat: 'Web', whatsapp: 'WA', instagram: 'IG',
  facebook: 'FB', telegram: 'TG', email: 'Email',
}

const statusFilters: (ConversationStatus | 'all')[] = ['all', 'active', 'escalated', 'waiting', 'resolved']

export default function InboxScreen({ navigation }: { navigation: any }) {
  const { organizationId } = useAuth()
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('active')
  const [channelFilter, setChannelFilter] = useState<ConversationChannel | 'all'>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const { data: conversations, refetch } = useQuery({
    queryKey: ['conversations', organizationId],
    queryFn: () => api.getConversations(organizationId!),
    enabled: !!organizationId,
  })

  useRealtimeSubscription(
    'conversations',
    organizationId ? `organization_id=eq.${organizationId}` : undefined,
    () => { refetch() },
    [organizationId],
  )

  useRealtimeSubscription(
    'messages',
    undefined,
    () => { refetch() },
    [],
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const filtered = (conversations ?? []).filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.customer_name?.toLowerCase().includes(q) && !c.customer_email?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 border-b border-gray-100 bg-white active:bg-gray-50"
      onPress={() => navigation.navigate('ConversationDetail', { id: item.id })}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: channelColors[item.channel] || '#94a3b8' }}>
        <Text className="text-white text-xs font-bold">{channelLabels[item.channel] || '?'}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-gray-900 text-sm">{item.customer_name || 'Anonymous'}</Text>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sentimentColors[item.sentiment] || '#94a3b8' }} />
            <Text className="text-xs text-gray-400">
              {new Date(item.updated_at || item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
          {item.messages?.[0]?.content || item.channel.replace('_', ' ')}
        </Text>
        {item.status === 'escalated' && (
          <View className="bg-red-100 self-start px-2 py-0.5 rounded mt-1">
            <Text className="text-red-600 text-xs font-medium">Escalated</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-3 pb-2 border-b border-gray-200">
        <TextInput
          className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm"
          placeholder="Search conversations..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={statusFilters}
        keyExtractor={s => s}
        className="bg-white border-b border-gray-200 max-h-11"
        contentContainerClassName="px-3 gap-1"
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: s }) => (
          <TouchableOpacity
            className={`px-3 py-2 rounded-full ${statusFilter === s ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => setStatusFilter(s)}
          >
            <Text className={`text-xs font-medium ${statusFilter === s ? 'text-white' : 'text-gray-600'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-3">💬</Text>
            <Text className="text-gray-500 text-base">No conversations found</Text>
          </View>
        }
      />
    </View>
  )
}

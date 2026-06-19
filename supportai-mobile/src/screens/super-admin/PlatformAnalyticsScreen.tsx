import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export default function PlatformAnalyticsScreen() {
  const [stats, setStats] = useState({ orgs: 0, users: 0, conversations: 0, messages: 0 })
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async () => {
    const [orgs, users, conversations, messages] = await Promise.all([
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ])
    setStats({
      orgs: orgs.count ?? 0,
      users: users.count ?? 0,
      conversations: conversations.count ?? 0,
      messages: messages.count ?? 0,
    })
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }, [fetchStats])

  const cards = [
    { label: 'Organizations', value: stats.orgs, color: '#3b82f6' },
    { label: 'Users', value: stats.users, color: '#22c55e' },
    { label: 'Conversations', value: stats.conversations, color: '#8b5cf6' },
    { label: 'Messages', value: stats.messages, color: '#f59e0b' },
  ]

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="p-4">
        <View className="flex-row flex-wrap">
          {cards.map((card, i) => (
            <View key={i} className="w-1/2 p-1.5">
              <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <Text className="text-3xl font-bold text-gray-900">{card.value}</Text>
                <Text className="text-xs text-gray-500 mt-1">{card.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

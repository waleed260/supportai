import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import type { Lead } from '../../types'

const statusColors: Record<string, string> = {
  new: '#3b82f6', qualified: '#22c55e', converted: '#2563eb', lost: '#ef4444',
}

export default function LeadsScreen() {
  const { organizationId } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const { data: leads, refetch } = useQuery({
    queryKey: ['leads', organizationId],
    queryFn: () => api.getLeads(organizationId!),
    enabled: !!organizationId,
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.updateLeadStatus(id, status)
      refetch()
    } catch {}
  }

  const renderItem = ({ item }: { item: Lead }) => (
    <View className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900">{item.name || 'Unknown'}</Text>
        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColors[item.status] || '#94a3b8'}20` }}>
          <Text className="text-xs font-medium" style={{ color: statusColors[item.status] || '#94a3b8' }}>{item.status}</Text>
        </View>
      </View>
      {item.email ? <Text className="text-sm text-gray-500">📧 {item.email}</Text> : null}
      {item.phone ? <Text className="text-sm text-gray-500">📞 {item.phone}</Text> : null}
      {item.product_interest ? <Text className="text-sm text-gray-500 mt-0.5">🏷️ {item.product_interest}</Text> : null}
      {item.source ? <Text className="text-xs text-gray-400 mt-1">via {item.source}</Text> : null}
      <View className="flex-row gap-2 mt-3">
        {['new', 'qualified', 'converted', 'lost'].map(s => (
          <TouchableOpacity key={s} className={`px-2.5 py-1 rounded-lg border ${item.status === s ? 'bg-primary border-primary' : 'border-gray-300'}`}
            onPress={() => updateStatus(item.id, s)}>
            <Text className={`text-xs ${item.status === s ? 'text-white' : 'text-gray-600'}`}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={leads ?? []}
        keyExtractor={l => l.id}
        renderItem={renderItem}
        contentContainerClassName="py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-gray-500 text-base">No leads yet</Text>
          </View>
        }
      />
    </View>
  )
}

import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { useState, useCallback } from 'react'
import { FlashList } from '@shopify/flash-list'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { useRealtimeSubscription } from '../../hooks/useRealtime'
import type { Lead } from '../../types'

const statusColors: Record<string, string> = {
  new: '#3b82f6', qualified: '#22c55e', converted: '#2563eb', lost: '#ef4444',
}

export default function LeadsScreen() {
  const { organizationId } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()

  const { data: leads, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['leads', organizationId],
    queryFn: () => api.getLeads(organizationId!),
    enabled: !!organizationId,
  })

  useRealtimeSubscription(
    'leads',
    organizationId ? `organization_id=eq.${organizationId}` : undefined,
    () => { queryClient.invalidateQueries({ queryKey: ['leads', organizationId] }) },
    [organizationId],
  )

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', organizationId] })
    },
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const renderItem = ({ item }: { item: Lead }) => (
    <View className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900 dark:text-gray-100">{item.name || 'Unknown'}</Text>
        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColors[item.status] || '#94a3b8'}20` }}>
          <Text className="text-xs font-medium" style={{ color: statusColors[item.status] || '#94a3b8' }}>{item.status}</Text>
        </View>
      </View>
      {item.email ? <Text className="text-sm text-gray-500 dark:text-gray-400">📧 {item.email}</Text> : null}
      {item.phone ? <Text className="text-sm text-gray-500 dark:text-gray-400">📞 {item.phone}</Text> : null}
      {item.product_interest ? <Text className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">🏷️ {item.product_interest}</Text> : null}
      {item.source ? <Text className="text-xs text-gray-400 mt-1 dark:text-gray-500">via {item.source}</Text> : null}
      <View className="flex-row gap-2 mt-3">
        {['new', 'qualified', 'converted', 'lost'].map(s => (
          <TouchableOpacity key={s} className={`px-2.5 py-1 rounded-lg border ${item.status === s ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}
            onPress={() => updateMutation.mutate({ id: item.id, status: s })}>
            <Text className={`text-xs ${item.status === s ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-gray-500 text-base text-center dark:text-gray-400">Failed to load leads</Text>
        <TouchableOpacity className="bg-primary px-6 py-2.5 rounded-xl mt-4" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlashList
        data={leads ?? []}
        keyExtractor={(l: Lead) => l.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📋</Text>
            <Text className="text-gray-500 text-base dark:text-gray-400">No leads yet</Text>
          </View>
        }
      />
    </View>
  )
}

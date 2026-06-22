import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { AnalyticsSkeleton } from '../../components/Skeleton'

export default function AnalyticsScreen() {
  const { organizationId } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const { data: metrics, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['metrics', organizationId],
    queryFn: () => api.getMetrics(organizationId!),
    enabled: !!organizationId,
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const cards = [
    { label: 'Total Conversations', value: metrics?.total_conversations ?? 0, color: '#3b82f6' },
    { label: 'Active Now', value: metrics?.active_conversations ?? 0, color: '#22c55e' },
    { label: 'Resolution Rate', value: metrics?.resolution_rate ? `${Math.round(metrics.resolution_rate * 100)}%` : '0%', color: '#8b5cf6' },
    { label: 'Avg Response', value: metrics?.avg_response_time ? `${Math.round(metrics.avg_response_time)}s` : '0s', color: '#f59e0b' },
  ]

  if (isLoading) return <AnalyticsSkeleton />

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-gray-500 text-base text-center dark:text-gray-400">Failed to load analytics</Text>
        <Text className="text-gray-400 text-sm mt-1 text-center dark:text-gray-500">{(error as Error)?.message || 'Check your connection'}</Text>
        <TouchableOpacity className="bg-primary px-6 py-2.5 rounded-xl mt-4" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="p-4">
        <View className="flex-row flex-wrap">
          {cards.map((card, i) => (
            <View key={i} className="w-1/2 p-1.5">
              <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <View className="w-8 h-8 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${card.color}20` }}>
                  <View className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</Text>
                <Text className="text-xs text-gray-500 mt-1 dark:text-gray-400">{card.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {metrics?.conversations_over_time && metrics.conversations_over_time.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mt-4 dark:bg-gray-800 dark:border-gray-700">
            <Text className="font-semibold text-gray-900 mb-3 dark:text-gray-100">Conversations Over Time</Text>
            {metrics.conversations_over_time.slice(-14).map((point, i) => (
              <View key={i} className="flex-row items-center mb-1.5">
                <Text className="text-xs text-gray-500 w-24 dark:text-gray-400">
                  {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
                <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                  <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (point.count / Math.max(...metrics.conversations_over_time.map(p => p.count), 1)) * 100)}%` }} />
                </View>
                <Text className="text-xs text-gray-500 ml-2 w-8 text-right dark:text-gray-400">{point.count}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mt-4 dark:bg-gray-800 dark:border-gray-700">
          <Text className="font-semibold text-gray-900 mb-3 dark:text-gray-100">Sentiment Breakdown</Text>
          {metrics?.sentiment_breakdown && Object.entries(metrics.sentiment_breakdown).length > 0 ? (
            Object.entries(metrics.sentiment_breakdown).map(([key, val]) => (
              <View key={key} className="flex-row items-center mb-2">
                <Text className="text-sm text-gray-600 w-24 capitalize dark:text-gray-300">{key}</Text>
                <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                  <View className="h-full rounded-full" style={{ width: `${Math.min(100, val as number)}%`, backgroundColor: '#3b82f6' }} />
                </View>
                <Text className="text-xs text-gray-500 ml-2 w-10 text-right dark:text-gray-400">{Math.round(val as number)}%</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-400 text-sm dark:text-gray-500">No sentiment data available</Text>
          )}
        </View>

        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mt-4 dark:bg-gray-800 dark:border-gray-700">
          <Text className="font-semibold text-gray-900 mb-3 dark:text-gray-100">Channel Breakdown</Text>
          {metrics?.conversations_by_channel && Object.entries(metrics.conversations_by_channel).length > 0 ? (
            Object.entries(metrics.conversations_by_channel).map(([key, val]) => (
              <View key={key} className="flex-row items-center mb-2">
                <Text className="text-sm text-gray-600 w-24 capitalize dark:text-gray-300">{key.replace('_', ' ')}</Text>
                <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                  <View className="h-full rounded-full" style={{ width: `${Math.min(100, (val as number) / (metrics.total_conversations || 1) * 100)}%`, backgroundColor: '#22c55e' }} />
                </View>
                <Text className="text-xs text-gray-500 ml-2 w-10 text-right dark:text-gray-400">{val as number}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-400 text-sm dark:text-gray-500">No channel data available</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

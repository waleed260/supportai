import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Organization } from '../../types'

const statusColors: Record<string, string> = {
  pending: '#f59e0b', active: '#22c55e', paused: '#94a3b8', suspended: '#ef4444',
}

export default function ClientsScreen() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrgs = useCallback(async () => {
    const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })
    if (data) setOrgs(data)
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchOrgs()
    setRefreshing(false)
  }, [fetchOrgs])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('organizations').update({ status }).eq('id', id)
    fetchOrgs()
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orgs}
        keyExtractor={o => o.id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerClassName="p-4"
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold text-gray-900">{item.name}</Text>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${statusColors[item.status || 'pending']}20` }}>
                <Text className="text-xs font-medium" style={{ color: statusColors[item.status || 'pending'] }}>
                  {item.status || 'pending'}
                </Text>
              </View>
            </View>
            {item.company_size ? <Text className="text-sm text-gray-500">Size: {item.company_size}</Text> : null}
            <Text className="text-xs text-gray-400 mt-1">Created {new Date(item.created_at).toLocaleDateString()}</Text>
            {item.status === 'pending' && (
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg flex-1 items-center" onPress={() => updateStatus(item.id, 'active')}>
                  <Text className="text-white text-xs font-semibold">Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-red-500 px-4 py-2 rounded-lg flex-1 items-center" onPress={() => updateStatus(item.id, 'suspended')}>
                  <Text className="text-white text-xs font-semibold">Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-gray-400 text-base">No organizations yet</Text>
          </View>
        }
      />
    </View>
  )
}

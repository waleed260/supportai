import { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { useRealtimeSubscription } from '../../hooks/useRealtime'
import type { Conversation, Message } from '../../types'

const roleColors: Record<string, string> = {
  customer: '#f1f5f9',
  assistant: '#eff6ff',
  agent: '#f0fdf4',
  system: '#fef2f2',
}

const roleColorsDark: Record<string, string> = {
  customer: '#1f2937',
  assistant: '#1e3a5f',
  agent: '#1a3a1a',
  system: '#3a1a1a',
}

export default function ConversationDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { id } = route.params
  const queryClient = useQueryClient()
  const { organizationId } = useAuth()
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState('')
  const flatListRef = useRef<any>(null)

  const { data: conversation, isLoading: convLoading, isError: convError, refetch: refetchConv } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => api.getConversation(id),
  })

  const { data: messages, isLoading: msgLoading, isError: msgError, refetch: refetchMsg } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const conv = await api.getConversation(id)
      return conv.messages ?? []
    },
  })

  useRealtimeSubscription(
    'messages',
    organizationId ? `organization_id=eq.${organizationId}` : undefined,
    () => { queryClient.invalidateQueries({ queryKey: ['messages', id] }) },
    [id, organizationId],
  )

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] })
      setInput('')
      setSendError('')
    },
    onError: (err: Error) => {
      setSendError(err.message || 'Failed to send message')
    },
  })

  const takeOverMutation = useMutation({
    mutationFn: () => api.takeOverConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    },
  })

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  const refetchAll = () => { refetchConv(); refetchMsg() }

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`mx-4 my-1 p-3 rounded-2xl max-w-[80%] ${item.role === 'customer' ? 'self-start' : 'self-end'}`}
      style={{ backgroundColor: roleColors[item.role] || '#f1f5f9' }}>
      <Text className="text-xs text-gray-400 mb-1 uppercase dark:text-gray-500">{item.role}</Text>
      <Text className="text-sm text-gray-800 dark:text-gray-200">{item.content}</Text>
      <Text className="text-xs text-gray-400 mt-1 self-end dark:text-gray-500">
        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  )

  if (convLoading || msgLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-400 mt-3 dark:text-gray-500">Loading conversation...</Text>
      </View>
    )
  }

  if (convError) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center px-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-gray-500 text-base text-center dark:text-gray-400">Failed to load conversation</Text>
        <TouchableOpacity className="bg-primary px-6 py-2.5 rounded-xl mt-4" onPress={refetchAll}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white dark:bg-gray-900">
      {conversation?.status === 'escalated' && (
        <View className="bg-red-50 px-4 py-2.5 border-b border-red-200 flex-row items-center justify-between dark:bg-red-900 dark:border-red-800">
          <Text className="text-red-700 text-sm font-medium dark:text-red-300">Escalated conversation</Text>
          <TouchableOpacity className="bg-red-500 px-4 py-1.5 rounded-lg" onPress={() => takeOverMutation.mutate()}>
            <Text className="text-white text-xs font-semibold">Take Over</Text>
          </TouchableOpacity>
        </View>
      )}

      {msgError && (
        <View className="bg-yellow-50 px-4 py-2 border-b border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800">
          <Text className="text-yellow-700 text-xs dark:text-yellow-300">Could not load messages. Pull down to retry.</Text>
        </View>
      )}

      <FlashList
        ref={flatListRef}
        data={messages ?? []}
        keyExtractor={(m: Message) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-gray-400 dark:text-gray-500">No messages yet</Text>
          </View>
        }
      />

      {sendError ? (
        <View className="bg-red-50 px-4 py-1.5 border-t border-red-200 dark:bg-red-900 dark:border-red-800">
          <Text className="text-red-600 text-xs dark:text-red-300">{sendError}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center border-t border-gray-200 px-4 py-2.5 bg-white dark:bg-gray-800 dark:border-gray-700">
        <TextInput
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm max-h-20 dark:bg-gray-700 dark:text-gray-100"
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          className="bg-primary rounded-full w-10 h-10 items-center justify-center ml-2"
          onPress={() => { if (input.trim()) sendMutation.mutate(input.trim()) }}
          disabled={!input.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-lg">↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

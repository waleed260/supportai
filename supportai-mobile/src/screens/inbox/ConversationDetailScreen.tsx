import { useState, useRef, useEffect } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
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

export default function ConversationDetailScreen({ route }: { route: any }) {
  const { id } = route.params
  const queryClient = useQueryClient()
  const { organizationId } = useAuth()
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const { data: conversation } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => api.getConversation(id),
  })

  const { data: messages } = useQuery({
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`mx-4 my-1 p-3 rounded-2xl max-w-[80%] ${item.role === 'customer' ? 'self-start' : 'self-end'}`}
      style={{ backgroundColor: roleColors[item.role] || '#f1f5f9' }}>
      <Text className="text-xs text-gray-400 mb-1 uppercase">{item.role}</Text>
      <Text className="text-sm text-gray-800">{item.content}</Text>
      <Text className="text-xs text-gray-400 mt-1 self-end">
        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  )

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      {conversation?.status === 'escalated' && (
        <View className="bg-red-50 px-4 py-2.5 border-b border-red-200 flex-row items-center justify-between">
          <Text className="text-red-700 text-sm font-medium">Escalated conversation</Text>
          <TouchableOpacity className="bg-red-500 px-4 py-1.5 rounded-lg" onPress={() => takeOverMutation.mutate()}>
            <Text className="text-white text-xs font-semibold">Take Over</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages ?? []}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerClassName="py-4"
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-gray-400">No messages yet</Text>
          </View>
        }
      />

      <View className="flex-row items-center border-t border-gray-200 px-4 py-2.5 bg-white">
        <TextInput
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm max-h-20"
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          className="bg-primary rounded-full w-10 h-10 items-center justify-center ml-2"
          onPress={() => { if (input.trim()) sendMutation.mutate(input.trim()) }}
          disabled={!input.trim() || sendMutation.isPending}
        >
          <Text className="text-white text-lg">↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

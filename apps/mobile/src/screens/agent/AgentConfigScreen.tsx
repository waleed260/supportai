import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

export default function AgentConfigScreen() {
  const { organizationId } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [personality, setPersonality] = useState('')
  const [tone, setTone] = useState('')
  const [brandGuidelines, setBrandGuidelines] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', organizationId],
    queryFn: () => api.getAgent(organizationId!),
    enabled: !!organizationId,
  })

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setPersonality(agent.personality)
      setTone(agent.tone_of_voice)
      setBrandGuidelines(agent.brand_guidelines ?? '')
      setCustomInstructions(agent.custom_instructions ?? '')
    }
  }, [agent])

  const saveMutation = useMutation({
    mutationFn: () => api.updateAgent(organizationId!, { name, personality, tone_of_voice: tone, brand_guidelines: brandGuidelines, custom_instructions: customInstructions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', organizationId] })
      Alert.alert('Saved', 'Agent configuration updated')
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4">
      <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Agent Name</Text>
          <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-base" value={name} onChangeText={setName} />
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Personality</Text>
          <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-base" value={personality} onChangeText={setPersonality} placeholder="e.g. professional, friendly" />
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Tone of Voice</Text>
          <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-base" value={tone} onChangeText={setTone} placeholder="e.g. friendly, formal" />
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Brand Guidelines</Text>
          <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-base" value={brandGuidelines} onChangeText={setBrandGuidelines} multiline numberOfLines={3} placeholder="Describe your brand voice..." />
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Custom Instructions</Text>
          <TextInput className="border border-gray-300 rounded-xl px-4 py-3 text-base" value={customInstructions} onChangeText={setCustomInstructions} multiline numberOfLines={4} placeholder="Specific instructions for the AI..." />
        </View>
        <TouchableOpacity className="bg-primary rounded-xl py-3.5 items-center mt-2" onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

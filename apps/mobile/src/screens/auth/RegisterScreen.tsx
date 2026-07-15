import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { api } from '../../lib/api'

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password || !companyName) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.register(email, password, name, companyName, companySize || undefined)
      setSuccess(true)
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <View className="flex-1 justify-center items-center px-8 bg-white">
        <Text className="text-2xl font-bold text-green-600 mb-4">Account Created!</Text>
        <Text className="text-gray-600 text-center mb-6">
          Your account is pending approval by our team. You'll be notified once it's approved.
        </Text>
        <TouchableOpacity className="bg-primary rounded-xl py-3.5 px-8" onPress={() => navigation.navigate('Login')}>
          <Text className="text-white font-semibold text-base">Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow justify-center px-8 py-12">
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-primary">SupportAI</Text>
          <Text className="text-base text-gray-500 mt-2">Create your account</Text>
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Your Name *</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-base" value={name} onChangeText={setName} editable={!loading} />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Email *</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-base" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!loading} />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Password *</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-base" value={password} onChangeText={setPassword} secureTextEntry editable={!loading} />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Company Name *</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-base" value={companyName} onChangeText={setCompanyName} editable={!loading} />
          </View>

          <TouchableOpacity className="bg-primary rounded-xl py-3.5 items-center mt-2" onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Create Account</Text>}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary text-sm font-medium">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

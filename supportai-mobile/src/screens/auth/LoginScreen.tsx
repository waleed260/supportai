import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../../hooks/useAuth'

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (e: any) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-primary">SupportAI</Text>
          <Text className="text-base text-gray-500 mt-2">Sign in to your account</Text>
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-3.5 items-center mt-2"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="items-center mt-2">
            <Text className="text-primary text-sm">Forgot password?</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary text-sm font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

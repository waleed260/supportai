import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!email) { setError('Enter your email'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'supportai://reset-password',
    })
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <View className="flex-1 justify-center px-8 bg-white">
      <View className="mb-8 items-center">
        <Text className="text-2xl font-bold text-primary">Reset Password</Text>
      </View>

      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : null}

      {sent ? (
        <View>
          <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <Text className="text-green-700 text-sm">Check your email for a password reset link.</Text>
          </View>
          <TouchableOpacity className="items-center mt-4" onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary text-sm font-medium">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-4">
          <Text className="text-gray-600 text-sm mb-2">Enter your email and we'll send you a reset link.</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base"
            placeholder="you@company.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity className="bg-primary rounded-xl py-3.5 items-center" onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Send Reset Link</Text>}
          </TouchableOpacity>
          <TouchableOpacity className="items-center mt-2" onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary text-sm">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

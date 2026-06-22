import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { supabase } from '../../lib/supabase'
import * as SecureStore from 'expo-secure-store'

export default function ResetPasswordScreen({ navigation }: { navigation: any }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (!password || !confirmPassword) { setError('Fill in all fields'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <View className="flex-1 justify-center px-8 bg-white dark:bg-gray-900">
        <View className="items-center">
          <Text className="text-4xl mb-4">✅</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Password Reset</Text>
          <Text className="text-gray-500 text-center dark:text-gray-400">Your password has been updated successfully.</Text>
          <TouchableOpacity className="bg-primary rounded-xl py-3.5 px-8 items-center mt-6" onPress={() => navigation.navigate('Login')}>
            <Text className="text-white font-semibold">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center px-8">
        <View className="mb-8 items-center">
          <Text className="text-2xl font-bold text-primary">Set New Password</Text>
          <Text className="text-gray-500 mt-2 text-center dark:text-gray-400">Enter your new password below.</Text>
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 dark:bg-red-900 dark:border-red-800">
            <Text className="text-red-600 text-sm dark:text-red-300">{error}</Text>
          </View>
        ) : null}

        <View className="space-y-4">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            placeholder="New password (min 8 chars)"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            placeholder="Confirm new password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity className="bg-primary rounded-xl py-3.5 items-center" onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Reset Password</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

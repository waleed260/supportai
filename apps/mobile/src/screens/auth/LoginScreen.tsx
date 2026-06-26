import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      const pref = await AsyncStorage.getItem('biometric_enabled')
      setBiometricAvailable(compatible && enrolled && pref === 'true')
    })()
  }, [])

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in to SupportAI',
      disableDeviceFallback: false,
    })
    if (result.success) {
      const stored = await AsyncStorage.getItem('biometric_credentials')
      if (stored) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(stored)
        setEmail(savedEmail)
        setPassword(savedPassword)
        handleLogin(savedEmail, savedPassword)
      }
    }
  }

  const handleLogin = async (e?: string, p?: string) => {
    const emailVal = e || email
    const passVal = p || password
    if (!emailVal || !passVal) { setError('Please fill in all fields'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailVal)) { setError('Please enter a valid email'); return }
    setLoading(true)
    setError('')
    try {
      await signIn(emailVal, passVal)
      await AsyncStorage.setItem('biometric_credentials', JSON.stringify({ email: emailVal, password: passVal }))
    } catch {
      setError('Incorrect email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center px-8">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-primary">SupportAI</Text>
          <Text className="text-base text-gray-500 mt-2 dark:text-gray-400">Sign in to your account</Text>
        </View>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 dark:bg-red-900 dark:border-red-800">
            <Text className="text-red-600 text-sm dark:text-red-300">{error}</Text>
          </View>
        ) : null}

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              placeholder="you@company.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-3.5 items-center mt-2"
            onPress={() => handleLogin()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              className="border border-gray-300 rounded-xl py-3.5 items-center dark:border-gray-600"
              onPress={handleBiometric}
            >
              <Text className="text-gray-700 font-medium text-base dark:text-gray-300">
                {Platform.OS === 'ios' ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="items-center mt-2">
            <Text className="text-primary text-sm">Forgot password?</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm dark:text-gray-400">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary text-sm font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

import { useCallback, useEffect, useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import { Platform } from 'react-native'
import { secureStorageKeys } from '@supportai/config'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../stores/authStore'

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType[]>([])
  const { biometricEnabled, setBiometricEnabled } = useAuthStore()

  useEffect(() => {
    if (Platform.OS === 'web') return
    LocalAuthentication.getEnrolledLevelAsync().then((level) => {
      setIsAvailable(level > 0)
    })
    LocalAuthentication.supportedAuthenticationTypesAsync().then(setBiometricType)
  }, [])

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true
    if (!biometricEnabled) return true

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })
    return result.success
  }, [biometricEnabled])

  const toggleBiometric = useCallback(async () => {
    if (Platform.OS === 'web') return
    const newState = !biometricEnabled
    setBiometricEnabled(newState)
    if (newState) {
      await SecureStore.setItemAsync(secureStorageKeys.biometricEnabled, 'true')
    } else {
      await SecureStore.deleteItemAsync(secureStorageKeys.biometricEnabled)
    }
  }, [biometricEnabled, setBiometricEnabled])

  return { isAvailable, biometricType, biometricEnabled, authenticate, toggleBiometric }
}

import { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { fetchNotificationPreferences, updateNotificationPreferences } from '../../lib/notifications'
import type { Membership } from '../../types'

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { user, signOut, role, memberships, organizationId } = useAuth()
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ escalation_alerts: true, usage_alerts: true, billing_alerts: true })
  const [notifLoading, setNotifLoading] = useState(true)

  const { data: agent } = useQuery({
    queryKey: ['agent', organizationId],
    queryFn: () => api.getAgent(organizationId!),
    enabled: !!organizationId,
  })

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setBiometricAvailable(compatible && enrolled)
      const pref = await AsyncStorage.getItem('biometric_enabled')
      setBiometricEnabled(pref === 'true')
    })()
  }, [])

  useEffect(() => {
    if (!organizationId) return
    setNotifLoading(true)
    fetchNotificationPreferences(organizationId)
      .then(setNotifPrefs)
      .finally(() => setNotifLoading(false))
  }, [organizationId])

  const toggleBiometric = async (val: boolean) => {
    if (val) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric login',
      })
      if (!result.success) { return }
    }
    setBiometricEnabled(val)
    await AsyncStorage.setItem('biometric_enabled', val ? 'true' : 'false')
  }

  const toggleNotifPref = useCallback(async (key: 'escalation_alerts' | 'usage_alerts' | 'billing_alerts') => {
    if (!organizationId) return
    const newVal = !notifPrefs[key]
    setNotifPrefs(prev => ({ ...prev, [key]: newVal }))
    try {
      await updateNotificationPreferences(organizationId, { [key]: newVal })
    } catch {
      setNotifPrefs(prev => ({ ...prev, [key]: !newVal }))
    }
  }, [organizationId, notifPrefs])

  const members = memberships.filter(m => m.organization_id === organizationId)
  const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'client_admin' ? 'Client Admin' : 'Team Member'

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white mx-4 mt-6 rounded-2xl p-5 border border-gray-100 shadow-sm">
        <View className="items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">{user?.full_name}</Text>
          <Text className="text-sm text-gray-500">{user?.email}</Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full mt-2">
            <Text className="text-primary text-xs font-medium">{roleLabel}</Text>
          </View>
        </View>
      </View>

      {biometricAvailable && (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-medium text-gray-900">Biometric Unlock</Text>
              <Text className="text-xs text-gray-500 mt-0.5">Use Face ID / fingerprint to sign in</Text>
            </View>
            <Switch value={biometricEnabled} onValueChange={toggleBiometric} trackColor={{ true: '#2563eb' }} />
          </View>
        </View>
      )}

      <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100 shadow-sm">
        <Text className="font-medium text-gray-900 mb-3">Notification Preferences</Text>
        {notifLoading ? (
          <Text className="text-gray-400 text-sm">Loading...</Text>
        ) : (
          <>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Escalation Alerts</Text>
                <Text className="text-xs text-gray-500">Notify when conversations escalate</Text>
              </View>
              <Switch
                value={notifPrefs.escalation_alerts}
                onValueChange={() => toggleNotifPref('escalation_alerts')}
                trackColor={{ true: '#2563eb' }}
              />
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-50">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Usage Alerts</Text>
                <Text className="text-xs text-gray-500">Monthly conversation limit warnings</Text>
              </View>
              <Switch
                value={notifPrefs.usage_alerts}
                onValueChange={() => toggleNotifPref('usage_alerts')}
                trackColor={{ true: '#2563eb' }}
              />
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-50">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Billing Alerts</Text>
                <Text className="text-xs text-gray-500">Payment and subscription updates</Text>
              </View>
              <Switch
                value={notifPrefs.billing_alerts}
                onValueChange={() => toggleNotifPref('billing_alerts')}
                trackColor={{ true: '#2563eb' }}
              />
            </View>
          </>
        )}
      </View>

      {role === 'client_admin' && (
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100 shadow-sm">
          <TouchableOpacity onPress={() => navigation.navigate('AgentConfig')}>
            <Text className="font-medium text-gray-900">Agent Configuration</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Edit AI agent settings</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100 shadow-sm">
        <Text className="font-medium text-gray-900 mb-3">Team Members</Text>
        {members.length === 0 ? (
          <Text className="text-gray-400 text-sm">No team members</Text>
        ) : (
          members.map((m: Membership) => (
            <View key={m.id} className="flex-row items-center py-2 border-b border-gray-50">
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-3">
                <Text className="text-xs font-bold text-gray-600">{m.user?.full_name?.charAt(0) || '?'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">{m.user?.full_name || 'Unknown'}</Text>
                <Text className="text-xs text-gray-400 capitalize">{m.role.replace('_', ' ')}</Text>
              </View>
            </View>
          ))
        )}
        {role === 'client_admin' && (
          <TouchableOpacity className="mt-3 bg-gray-100 rounded-xl py-2.5 items-center">
            <Text className="text-primary text-sm font-medium">+ Invite Member</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100 shadow-sm items-center" onPress={signOut}>
        <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
      </TouchableOpacity>

      <View className="h-10" />
    </ScrollView>
  )
}

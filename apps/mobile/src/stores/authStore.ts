import { create } from 'zustand'
import type { User, Membership, Organization } from '@supportai/types'
import { secureStorageKeys } from '@supportai/config'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

interface AuthStore {
  user: User | null
  membership: Membership | null
  memberships: Membership[]
  role: string | null
  organizationId: string | null
  organization: Organization | null
  isLoading: boolean
  isPendingApproval: boolean
  biometricEnabled: boolean
  setUser: (user: User | null) => void
  setMemberships: (memberships: Membership[]) => void
  setLoading: (loading: boolean) => void
  setBiometricEnabled: (enabled: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  membership: null,
  memberships: [],
  role: null,
  organizationId: null,
  organization: null,
  isLoading: true,
  isPendingApproval: false,
  biometricEnabled: false,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setMemberships: (memberships) => {
    const membership = memberships[0] ?? null
    set({
      memberships,
      membership,
      role: membership?.role ?? null,
      organizationId: membership?.organization_id ?? null,
      organization: membership?.organization ?? null,
      isPendingApproval: membership?.organization?.status === 'pending',
    })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setBiometricEnabled: async (enabled) => {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(secureStorageKeys.biometricEnabled, String(enabled))
    }
    set({ biometricEnabled: enabled })
  },
  reset: () => set(initialState),
}))

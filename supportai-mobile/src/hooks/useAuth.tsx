import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { User, Membership } from '../types'

interface AuthState {
  user: User | null
  membership: Membership | null
  memberships: Membership[]
  role: string | null
  organizationId: string | null
  isLoading: boolean
  isPendingApproval: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshMembership: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const membership = memberships[0] ?? null
  const role = membership?.role ?? null
  const organizationId = membership?.organization_id ?? null
  const isPendingApproval = membership?.organization?.status === 'pending'

  const refreshMembership = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('memberships')
      .select('*, organization:organizations(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
    if (!error && data) {
      setMemberships(data)
    }
  }, [user])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          setUser({ id: profile.id, email: profile.email, full_name: profile.full_name, avatar_url: profile.avatar_url })
        }
        await refreshMembership()
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          setUser({ id: profile.id, email: profile.email, full_name: profile.full_name, avatar_url: profile.avatar_url })
        }
        await refreshMembership()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setMemberships([])
      } else if (event === 'TOKEN_REFRESHED') {
        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync('sb-refresh-token', session?.refresh_token ?? '')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshMembership])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session?.refresh_token && Platform.OS !== 'web') {
      await SecureStore.setItemAsync('sb-refresh-token', data.session.refresh_token)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('sb-refresh-token')
    }
    setUser(null)
    setMemberships([])
  }

  return (
    <AuthContext.Provider
      value={{ user, membership, memberships, role, organizationId, isLoading, isPendingApproval, signIn, signOut, refreshMembership }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User, Membership } from '@supportai/types'

export interface AuthState {
  user: User | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  membership: Membership | null
  memberships: Membership[]
  role: string | null
  organizationId: string | null
  isLoading: boolean
  isPendingApproval: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshMembership: () => Promise<void>
  getValidToken: () => Promise<string | null>
}

export function createAuthManager(supabase: SupabaseClient, tokenStorage?: { get: () => Promise<string | null>; set: (token: string) => Promise<void>; delete: () => Promise<void> }) {
  const getProfile = async (userId: string): Promise<User | null> => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (!data) return null
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      locale: data.locale,
      timezone: data.timezone,
    }
  }

  const getMemberships = async (userId: string): Promise<Membership[]> => {
    const { data } = await supabase
      .from('memberships')
      .select('*, organization:organizations(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
    return (data ?? []) as Membership[]
  }

  const refreshSession = async (): Promise<{
    user: User | null
    supabaseUser: SupabaseUser | null
    session: Session | null
    memberships: Membership[]
  }> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { user: null, supabaseUser: null, session: null, memberships: [] }

    if (session.refresh_token && tokenStorage) {
      await tokenStorage.set(session.refresh_token)
    }

    const [profile, memberships] = await Promise.all([
      getProfile(session.user.id),
      getMemberships(session.user.id),
    ])

    return {
      user: profile,
      supabaseUser: session.user,
      session,
      memberships,
    }
  }

  return { getProfile, getMemberships, refreshSession }
}

export function useAuthState(supabase: SupabaseClient): [AuthState, AuthActions] {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    session: null,
    membership: null,
    memberships: [],
    role: null,
    organizationId: null,
    isLoading: true,
    isPendingApproval: false,
  })

  const refreshMembership = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const memberships = await createAuthManager(supabase).getMemberships(session.user.id)
    setState(prev => ({
      ...prev,
      memberships,
      membership: memberships[0] ?? null,
      role: memberships[0]?.role ?? null,
      organizationId: memberships[0]?.organization_id ?? null,
      isPendingApproval: memberships[0]?.organization?.status === 'pending',
    }))
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const manager = createAuthManager(supabase)
      const result = await manager.refreshSession()
      setState({
        ...result,
        membership: result.memberships[0] ?? null,
        role: result.memberships[0]?.role ?? null,
        organizationId: result.memberships[0]?.organization_id ?? null,
        isPendingApproval: result.memberships[0]?.organization?.status === 'pending',
        isLoading: false,
      })
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const manager = createAuthManager(supabase)
        if (session?.user) {
          const profile = await manager.getProfile(session.user.id)
          const memberships = await manager.getMemberships(session.user.id)
          setState({
            user: profile,
            supabaseUser: session.user,
            session,
            memberships,
            membership: memberships[0] ?? null,
            role: memberships[0]?.role ?? null,
            organizationId: memberships[0]?.organization_id ?? null,
            isPendingApproval: memberships[0]?.organization?.status === 'pending',
            isLoading: false,
          })
        }
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null, supabaseUser: null, session: null,
          membership: null, memberships: [], role: null,
          organizationId: null, isLoading: false, isPendingApproval: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const getValidToken = useCallback(async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }, [supabase])

  const actions: AuthActions = {
    signIn, signOut, refreshMembership, getValidToken,
  }

  return [state, actions]
}

export type { User, Membership }

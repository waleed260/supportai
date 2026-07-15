'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Membership } from '@/types'

interface AuthContextValue {
  user: User | null
  membership: Membership | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  membership: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children, initialUser, initialMembership }: {
  children: ReactNode
  initialUser?: User | null
  initialMembership?: Membership | null
}) {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [membership, setMembership] = useState<Membership | null>(initialMembership || null)
  const [loading, setLoading] = useState(!initialUser)
  const supabase = createClient()

  useEffect(() => {
    // If we already have initial data, no need to fetch
    if (initialUser && initialMembership) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const [profileResult, membershipsResult] = await Promise.all([
        supabase.from('users').select('*').eq('id', session.user.id).single(),
        supabase.from('memberships')
          .select('*, organization:organizations(*)')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .limit(1)
          .single(),
      ])

      if (profileResult.data) setUser(profileResult.data)
      if (membershipsResult.data) setMembership(membershipsResult.data)
      setLoading(false)
    }

    fetchData()
  }, [supabase, initialUser, initialMembership])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMembership(null)
  }

  return (
    <AuthContext.Provider value={{ user, membership, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}

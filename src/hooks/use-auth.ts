'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User, Membership } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(profile)

        const { data: orgs } = await supabase
          .from('memberships')
          .select('*, organization:organizations(*)')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
        setMemberships(orgs || [])
      }
      setLoading(false)
    }
    getSession()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isSuperAdmin = memberships.some(m => m.role === 'super_admin')
  const isClientAdmin = memberships.some(m => m.role === 'client_admin')
  const isTeamMember = memberships.some(m => m.role === 'team_member')
  const activeOrg = memberships[0]?.organization

  return { user, memberships, loading, signOut, isSuperAdmin, isClientAdmin, isTeamMember, activeOrg }
}

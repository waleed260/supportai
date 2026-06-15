'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import type { User, Membership } from '@/types'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setUser(profile)

      const { data: memberships } = await supabase
        .from('memberships')
        .select('*, organization:organizations(*)')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .limit(1)
        .single()
      setMembership(memberships)
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!membership) return null

  const role = membership.role

  return (
    <div className="min-h-screen flex">
      <Sidebar
        role={role}
        organizationName={membership.organization?.name}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} role={role} />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

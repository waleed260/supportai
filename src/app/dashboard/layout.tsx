'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Skeleton } from '@/components/ui/skeleton'
import type { User, Membership } from '@/types'

function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="w-64 border-r bg-sidebar p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b px-6 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <main className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </main>
      </div>
    </div>
  )
}

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

      const [profileResult, membershipsResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single(),
        supabase
          .from('memberships')
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
    init()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) return <DashboardSkeleton />

  if (!membership) return null

  const role = membership.role

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-background">
      <Sidebar
        role={role}
        organizationName={membership.organization?.name}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <DashboardHeader user={user} role={role} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

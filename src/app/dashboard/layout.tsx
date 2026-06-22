'use client'

import { useState } from 'react'
import { AuthProvider, useAuthContext } from '@/contexts/auth-context'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, membership, loading, signOut } = useAuthContext()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xs border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!membership) return null

  const role = membership.role

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        role={role}
        organizationName={membership.organization?.name}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSignOut={signOut}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} role={role} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  )
}

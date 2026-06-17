'use client'

import { useState } from 'react'
import { AuthProvider, useAuthContext } from '@/contexts/auth-context'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, membership, loading, signOut } = useAuthContext()
  const [collapsed, setCollapsed] = useState(false)

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
        onSignOut={signOut}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  )
}

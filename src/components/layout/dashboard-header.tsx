'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { User, MembershipRole } from '@/types'

interface DashboardHeaderProps {
  user: User | null
  role: MembershipRole
}

export function DashboardHeader({ user, role }: DashboardHeaderProps) {
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    client_admin: 'bg-blue-100 text-blue-800',
    team_member: 'bg-green-100 text-green-800',
  }

  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={roleColors[role]} variant="secondary">
          {role === 'super_admin' ? 'Super Admin' : role === 'client_admin' ? 'Admin' : 'Team Member'}
        </Badge>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user?.full_name}</span>
      </div>
    </header>
  )
}

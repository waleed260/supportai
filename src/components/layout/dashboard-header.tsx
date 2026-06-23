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

  const roleConfig = {
    super_admin: { label: 'Super Admin', classes: 'bg-primary/10 text-primary border-primary/20' },
    client_admin: { label: 'Admin', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' },
    team_member: { label: 'Team', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' },
  }

  const config = roleConfig[role]

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Online</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={`${config.classes} border text-xs font-medium rounded-sm`} variant="outline">
          {config.label}
        </Badge>
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-tight">{user?.full_name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </header>
  )
}

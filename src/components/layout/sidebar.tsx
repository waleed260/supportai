'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, MessageSquare, Bot, BookOpen, Globe, Users,
  Settings, BarChart3, CreditCard, LogOut, ChevronLeft, PanelLeft,
  Phone, Target,
} from 'lucide-react'
import type { MembershipRole } from '@/types'

interface SidebarProps {
  role: MembershipRole
  organizationName?: string
  collapsed: boolean
  onToggle: () => void
  onSignOut: () => void
}

const superAdminLinks = [
  { href: '/dashboard/super-admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/super-admin/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/dashboard/super-admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const adminLinks = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/dashboard/admin/agent', label: 'AI Agent', icon: Bot },
  { href: '/dashboard/admin/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/dashboard/admin/channels', label: 'Channels', icon: Globe },
  { href: '/dashboard/admin/leads', label: 'Leads', icon: Target },
  { href: '/dashboard/admin/escalations', label: 'Escalations', icon: Phone },
  { href: '/dashboard/admin/team', label: 'Team', icon: Users },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/billing', label: 'Billing', icon: CreditCard },
]

const teamLinks = [
  { href: '/dashboard/team', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/team/conversations', label: 'Conversations', icon: MessageSquare },
]

export function Sidebar({ role, organizationName, collapsed, onToggle, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  const links = role === 'super_admin'
    ? superAdminLinks
    : role === 'client_admin'
      ? adminLinks
      : teamLinks

  return (
    <aside className={cn(
      'border-r bg-sidebar flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <Link href="/dashboard" className="font-bold text-lg text-sidebar-primary">
            {organizationName || 'SupportAI'}
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className={collapsed ? 'mx-auto' : ''}>
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {links.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-2 border-t">
        <Button variant="ghost" className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')} onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}

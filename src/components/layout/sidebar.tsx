'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, MessageSquare, Bot, BookOpen, Globe, Users,
  Settings, BarChart3, CreditCard, LogOut, ChevronLeft, PanelLeft,
  Sparkles,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  { href: '/dashboard/admin/team', label: 'Team', icon: Users },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/billing', label: 'Billing', icon: CreditCard },
]

const teamLinks = [
  { href: '/dashboard/team', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/team/conversations', label: 'Conversations', icon: MessageSquare },
]

function SidebarLink({ href, label, icon: Icon, collapsed, isActive }: {
  href: string; label: string; icon: React.ComponentType<{ className?: string }>; collapsed: boolean; isActive: boolean
}) {
  const link = (
    <Link href={href}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 transition-all duration-200',
          collapsed && 'justify-center px-2',
          isActive && 'bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/25'
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", collapsed && "h-5 w-5")} />
        {!collapsed && <span>{label}</span>}
      </Button>
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>
          {link}
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export function Sidebar({ role, organizationName, collapsed, onToggle, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  const links = role === 'super_admin'
    ? superAdminLinks
    : role === 'client_admin'
      ? adminLinks
      : teamLinks

  return (
    <TooltipProvider>
      <aside className={cn(
        'border-r bg-sidebar flex flex-col transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo area */}
        <div className={cn(
          'p-4 border-b flex items-center transition-all duration-300',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          <div className={cn('flex items-center gap-2', collapsed && 'sr-only')}>
            <div className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <Link href="/dashboard" className="font-bold text-sm text-sidebar-primary truncate max-w-[120px]">
              {organizationName || 'SupportAI'}
            </Link>
          </div>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'icon-sm'}
            onClick={onToggle}
            className="shrink-0"
          >
            {collapsed
              ? <PanelLeft className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className={cn('space-y-1', collapsed ? 'px-2' : 'px-3')}>
            {links.map(link => (
              <SidebarLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                collapsed={collapsed}
                isActive={pathname === link.href}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Sign out */}
        <div className={cn('p-2 border-t', collapsed ? 'px-2' : 'px-3')}>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 text-muted-foreground hover:text-destructive transition-colors',
                  collapsed && 'justify-center px-2'
                )}
                onClick={onSignOut}
              >
                <LogOut className={cn("h-4 w-4 shrink-0", collapsed && "h-5 w-5")} />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">Sign Out</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}

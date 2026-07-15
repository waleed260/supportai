'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Settings, LogOut, User, HelpCircle } from 'lucide-react'
import type { User as UserType, MembershipRole } from '@/types'

interface DashboardHeaderProps {
  user: UserType | null
  role: MembershipRole
}

const roleConfig: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  client_admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  team_member: { label: 'Team Member', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
}

export function DashboardHeader({ user, role }: DashboardHeaderProps) {
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  const config = roleConfig[role] || roleConfig.team_member

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-40">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left - Page title area */}
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-default">Dashboard</span>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search - hidden on mobile */}
          <div className="hidden md:relative md:flex md:items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-8 w-48 lg:w-64 pl-8 rounded-lg bg-muted/50 border-0 focus-visible:bg-background"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive" />
          </Button>

          {/* Role badge */}
          <Badge className={`hidden sm:inline-flex text-xs ${config.color}`} variant="secondary">
            {config.label}
          </Badge>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                  {user?.full_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{user?.full_name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

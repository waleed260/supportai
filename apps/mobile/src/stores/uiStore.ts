import { create } from 'zustand'
import { ThemeMode } from '@supportai/types'

interface UIStore {
  theme: ThemeMode
  isDark: boolean
  unreadCounts: Record<string, number>
  activeFilters: {
    status: string
    channel: string
    search: string
  }
  sidebarOpen: boolean
  setTheme: (theme: ThemeMode) => void
  setIsDark: (isDark: boolean) => void
  setUnreadCount: (orgId: string, count: number) => void
  setActiveFilters: (filters: Partial<UIStore['activeFilters']>) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'system',
  isDark: false,
  unreadCounts: {},
  activeFilters: {
    status: 'active',
    channel: 'all',
    search: '',
  },
  sidebarOpen: false,
  setTheme: (theme) => set({ theme }),
  setIsDark: (isDark) => set({ isDark }),
  setUnreadCount: (orgId, count) => set((s) => ({
    unreadCounts: { ...s.unreadCounts, [orgId]: count },
  })),
  setActiveFilters: (filters) => set((s) => ({
    activeFilters: { ...s.activeFilters, ...filters },
  })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))

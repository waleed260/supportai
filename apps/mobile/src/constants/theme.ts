export const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceBorder: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  destructive: '#ef4444',
  destructiveLight: '#fef2f2',
  success: '#22c55e',
  successLight: '#f0fdf4',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  muted: '#f1f5f9',
  border: '#e2e8f0',
  card: '#ffffff',
  notification: '#ef4444',

  sentiment: {
    positive: '#22c55e',
    neutral: '#94a3b8',
    negative: '#f59e0b',
    frustrated: '#ef4444',
    high_risk: '#dc2626',
  },

  channel: {
    web_chat: '#3b82f6',
    whatsapp: '#25D366',
    instagram: '#E4405F',
    facebook: '#1877F2',
    telegram: '#0088cc',
    email: '#ea580c',
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const

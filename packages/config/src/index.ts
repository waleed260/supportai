export const performanceBudget = {
  coldLaunch: 2000,
  warmLaunch: 1000,
  conversationScroll: 60,
  animation: 60,
  memoryMB: 250,
  bundleMB: 30,
  apiLatencyMs: 500,
  timeToInteractive: 3000,
} as const

export const paginationDefaults = {
  conversations: 20,
  messages: 50,
  leads: 20,
  escalations: 20,
  analytics: 100,
} as const

export const cacheKeys = {
  conversations: (orgId: string) => ['conversations', orgId] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (convId: string) => ['messages', convId] as const,
  leads: (orgId: string) => ['leads', orgId] as const,
  escalations: (orgId: string) => ['escalations', orgId] as const,
  metrics: (orgId: string) => ['metrics', orgId] as const,
  agent: (orgId: string) => ['agent', orgId] as const,
  memberships: (userId: string) => ['memberships', userId] as const,
  plans: () => ['plans'] as const,
  notificationPrefs: (orgId: string) => ['notificationPrefs', orgId] as const,
  features: (orgId: string) => ['features', orgId] as const,
} as const

export const sentryTags = {
  organizationId: 'organization_id',
  userId: 'user_id',
  screen: 'screen',
  apiEndpoint: 'api_endpoint',
  statusCode: 'status_code',
  networkStatus: 'network_status',
  deviceInfo: 'device_info',
  platform: 'platform',
  osVersion: 'os_version',
  buildVersion: 'build_version',
  appVersion: 'app_version',
  releaseChannel: 'release_channel',
} as const

export const secureStorageKeys = {
  refreshToken: 'sb-refresh-token',
  authSession: 'sb-auth-session',
  biometricEnabled: 'biometric_enabled',
  pinCode: 'pin_code',
  themeMode: 'theme_mode',
  lastSyncTimestamp: 'last_sync_ts',
  onboardingCompleted: 'onboarding_completed',
  deviceId: 'device_id',
} as const

export const analyticsEvents = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  CONVERSATION_OPENED: 'conversation_opened',
  REPLY_SENT: 'reply_sent',
  PUSH_OPENED: 'push_opened',
  OFFLINE_MODE: 'offline_mode',
  LEAD_VIEWED: 'lead_viewed',
  ANALYTICS_VIEWED: 'analytics_viewed',
  SETTINGS_CHANGED: 'settings_changed',
  ESCALATION_RESOLVED: 'escalation_resolved',
  ERROR_OCCURRED: 'error_occurred',
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  SEARCH_PERFORMED: 'search_performed',
  DEEP_LINK_OPENED: 'deep_link_opened',
} as const

export const appLinks = {
  conversation: (id: string) => `supportai://conversation/${id}`,
  lead: (id: string) => `supportai://lead/${id}`,
  analytics: 'supportai://analytics',
  settings: 'supportai://settings',
  escalation: (id: string) => `supportai://escalation/${id}`,
  agent: (orgId: string) => `supportai://agent/${orgId}`,
} as const

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
  } as const,

  channel: {
    web_chat: '#3b82f6',
    whatsapp: '#25D366',
    instagram: '#E4405F',
    facebook: '#1877F2',
    telegram: '#0088cc',
    email: '#ea580c',
  } as const,
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

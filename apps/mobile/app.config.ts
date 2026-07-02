const appConfig = ({ config }: { config: Record<string, unknown> }) => ({
  ...config,
  expo: {
    ...(config.expo as Record<string, unknown>),
    name: 'SupportAI',
    slug: 'supportai-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      backgroundColor: '#2563eb',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.supportai.mobile',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#2563eb',
      },
      package: 'com.supportai.mobile',
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
    plugins: [
      'expo-secure-store',
      'expo-local-authentication',
      '@sentry/react-native',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#2563eb',
        },
      ],
    ],
  },
})

export default appConfig

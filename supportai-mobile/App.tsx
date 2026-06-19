import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, LinkingOptions } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react-native'
import { AuthProvider } from './src/hooks/useAuth'
import { ThemeProvider } from './src/hooks/useTheme'
import { useNotifications } from './src/hooks/useNotifications'
import ErrorBoundary from './src/components/ErrorBoundary'
import RootNavigator from './src/navigation/RootNavigator'
import './global.css'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 3600000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const linking: LinkingOptions<any> = {
  prefixes: ['supportai://', 'https://supportai.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Inbox: {
            screens: {
              ConversationDetail: 'conversation/:id',
            },
          },
          Escalations: {
            screens: {
              EscalationsList: 'escalations',
              ConversationDetail: 'escalation/:conversation_id',
            },
          },
        },
      },
    },
  },
}

function AppContent() {
  useNotifications()
  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  )
}

function AppInner() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default Sentry.wrap(function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppInner />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
})

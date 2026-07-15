import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from './src/hooks/useAuth'
import { ThemeProvider } from './src/hooks/useTheme'
import { useNotifications } from './src/hooks/useNotifications'
import { useNotificationHandler } from './src/hooks/useNotificationHandler'
import { initSentry } from './src/analytics/sentry'
import { registerSyncTask, registerRefreshTask } from './src/background'
import { linkingConfig } from './src/navigation/linking/config'
import ErrorBoundary from './src/components/ErrorBoundary'
import RootNavigator from './src/navigation/RootNavigator'
import './global.css'

initSentry()

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

function AppContent() {
  useNotifications()
  useNotificationHandler()

  useEffect(() => {
    registerSyncTask()
    registerRefreshTask()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={linkingConfig}>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

function AppInner() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default function App() {
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
}

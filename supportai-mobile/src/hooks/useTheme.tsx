import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useColorScheme, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeMode
  isDark: boolean
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setThemeState(val)
      }
    })
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    AsyncStorage.setItem('theme_mode', mode)
  }, [])

  const isDark = useMemo(() => {
    if (theme === 'system') return systemScheme === 'dark'
    return theme === 'dark'
  }, [theme, systemScheme])

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      <View className={`flex-1 ${isDark ? 'dark' : ''}`} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { ThemeConfig } from 'antd'
import { theme as antTheme } from 'antd'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  antThemeConfig: ThemeConfig
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_KEY = 'app_theme_mode'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    return 'light'
  })

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem(THEME_KEY, newMode)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'light' ? 'dark' : 'light')
  }, [mode, setTheme])

  const antThemeConfig = useMemo<ThemeConfig>(() => ({
    algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#2466c2',
    },
    components: {
      Layout: {
        headerBg: mode === 'dark' ? '#141414' : '#fff',
      },
    },
  }), [mode])

  const value = useMemo(() => ({
    mode,
    toggleTheme,
    setTheme,
    antThemeConfig,
  }), [mode, toggleTheme, setTheme, antThemeConfig])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

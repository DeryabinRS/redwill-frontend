import { useState, useCallback, useMemo } from 'react'
import type { ThemeConfig } from 'antd'
import { theme as antTheme } from 'antd'

export type ThemeMode = 'light' | 'dark'

interface UseThemeReturn {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  antThemeConfig: ThemeConfig
}

const THEME_KEY = 'app_theme_mode'

export function useTheme(): UseThemeReturn {
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
      colorPrimary: '#4b863f',
    },
  }), [mode])

  return {
    mode,
    toggleTheme,
    setTheme,
    antThemeConfig,
  }
}

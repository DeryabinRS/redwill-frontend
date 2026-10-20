import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const YANDEX_METRIKA_ID = 113686222

/**
 * Отправляет «просмотр страницы» (hit) в Яндекс Метрику при каждой смене маршрута.
 * Счётчик инициализирован в index.html с `defer: true`, поэтому автопросмотры отключены
 * и просмотры отправляются вручную через `ym(..., 'hit', url)`.
 */
export default function YandexMetrika() {
  const location = useLocation()
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const url = location.pathname + location.search

    // Защита от повторной отправки одного и того же URL (в т.ч. при StrictMode в dev).
    if (lastUrlRef.current === url) return
    lastUrlRef.current = url

    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      window.ym(YANDEX_METRIKA_ID, 'hit', url)
    }
  }, [location.pathname, location.search])

  return null
}

import { useEffect } from 'react'
import { setupPushNotifications } from '../api/push'

/**
 * Регистрирует Service Worker и подписывает пользователя на Web Push.
 * Срабатывает при загрузке приложения, если пользователь уже авторизован
 * (например, после обновления страницы). Для входа с нуля подписка
 * запускается в обработчике логина.
 */
export function usePushNotifications() {
  useEffect(() => {
    setupPushNotifications().catch(() => {})
  }, [])
}

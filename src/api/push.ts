import { API_URL } from '@config/constants'
import { getAuthToken, isAuthenticated } from '@utils/auth'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
const PUSH_SUBSCRIPTION_ID_KEY = 'push_subscription_id'
const baseUrl = API_URL || '/api'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(new ArrayBuffer(rawData.length))

  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i)
  }

  return output
}

function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch {
    return null
  }
}

export async function subscribeToPushNotifications(): Promise<PushSubscriptionJSON | null> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return null
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    return subscription.toJSON()
  } catch {
    return null
  }
}

/**
 * Полный цикл настройки Web Push: регистрация SW + запрос разрешения +
 * подписка + сохранение подписки на бэкенде. Безопасно вызывать в любой
 * момент (неавторизованный пользователь или отказ в разрешении — no-op).
 */
export async function setupPushNotifications(): Promise<void> {
  if (!isAuthenticated()) {
    return
  }

  await registerServiceWorker()
  const subscription = await subscribeToPushNotifications()
  if (subscription) {
    await savePushSubscription(subscription)
  }
}

export async function savePushSubscription(subscription: PushSubscriptionJSON): Promise<void> {
  const token = getAuthToken()
  if (!token) {
    return
  }

  try {
    const res = await fetch(`${baseUrl}/user/push-subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    })

    if (!res.ok) {
      return
    }

    const json = (await res.json()) as { data?: { id?: number | string } }
    const id = json?.data?.id
    if (id != null) {
      localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, String(id))
    }
  } catch {
    // ignore
  }
}

export async function unsubscribeFromPushNotifications(): Promise<void> {
  const id = localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)

  if (id) {
    const token = getAuthToken()
    if (token) {
      try {
        await fetch(`${baseUrl}/user/push-subscriptions/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // ignore
      }
    }
  }

  try {
    localStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY)
  } catch {
    // ignore
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }
    } catch {
      // ignore
    }
  }
}

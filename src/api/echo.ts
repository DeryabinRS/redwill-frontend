import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getAuthToken } from '@utils/auth'

declare global {
  interface Window {
    Pusher?: typeof Pusher
  }
}

const ECHO_KEY = import.meta.env.VITE_REVERB_APP_KEY as string | undefined
const ECHO_HOST = import.meta.env.VITE_REVERB_HOST ?? 'localhost'
const ECHO_PORT = Number(import.meta.env.VITE_REVERB_PORT) || 8080
const ECHO_SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? 'http'

let instance: Echo<'reverb'> | null = null

export function connectEcho(): Echo<'reverb'> | null {
  if (instance) {
    return instance
  }

  const token = getAuthToken()
  if (!token || !ECHO_KEY) {
    return null
  }

  window.Pusher = Pusher

  instance = new Echo({
    broadcaster: 'reverb',
    key: ECHO_KEY,
    wsHost: ECHO_HOST,
    wsPort: ECHO_PORT,
    wssPort: ECHO_PORT,
    forceTLS: ECHO_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  return instance
}

export function disconnectEcho(): void {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}
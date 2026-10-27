import { App } from 'antd'
import { useEffect, useRef } from 'react'
import { connectEcho, disconnectEcho } from '../api/echo'
import { useAppDispatch } from '../store/hooks'
import { notificationApi } from '@features/notification/notificationSlice'

type NotificationEvent = {
  id: number
  type: string
  title: string
  body: string | null
  data: Record<string, unknown> | null
}

export function useRealtimeNotifications(userId: number | undefined) {
  const dispatch = useAppDispatch()
  const { notification } = App.useApp()
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  useEffect(() => {
    if (!userId) return

    const echo = connectEcho()
    if (!echo) return

    const channelName = `App.Models.User.${userId}`

    try {
      const channel = echo.private(channelName)

      channel.listen('.user.notification', (event: NotificationEvent) => {
        dispatch(notificationApi.util.invalidateTags(['NotificationsUnread', 'Notifications']))

        if (event?.title) {
          notification.open({
            message: event.title,
            description: event.body ?? undefined,
            placement: 'topRight',
          })
        }
      })

      return () => {
        echo.leaveChannel(channelName)
      }
    } catch {
      // Auth error (not authenticated) — ignore
    }
  }, [dispatch, notification, userId])

  // Disconnect on logout
  useEffect(() => {
    return () => {
      disconnectEcho()
    }
  }, [])
}
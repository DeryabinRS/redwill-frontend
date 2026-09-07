import { App as AntdApp, Button, Checkbox, Empty, Listy, Spin, Typography } from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type UserNotification,
} from '@features/notification/notificationSlice'
import './Notifications.css'

function NotificationsPage() {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(20)
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation()

  const hasUnread = notifications.some((item) => !item.read_at)

  const openNotification = async (notification: UserNotification) => {
    if (!notification.read_at) {
      try {
        await markRead(notification.id).unwrap()
      } catch {
        // ignore
      }
    }
    const link = notification.data?.link
    if (link) navigate(link)
  }

  const onMarkAll = async () => {
    try {
      await markAllRead().unwrap()
      message.success(t('notifications.markedAllRead'))
    } catch {
      message.error(t('notifications.markAllError'))
    }
  }

  const onMarkRead = async (e: React.MouseEvent, notification: UserNotification) => {
    e.stopPropagation()
    try {
      await markRead(notification.id).unwrap()
    } catch {
      // ignore
    }
  }

  return (
    <div className="container notifications-page">
      <div className="notifications-page__head">
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t('notifications.title')}
        </Typography.Title>
        <Button type="link" disabled={!hasUnread} loading={isMarkingAll} onClick={() => void onMarkAll()}>
          {t('notifications.markAllRead')}
        </Button>
      </div>

      {isLoading ? (
        <div className="notifications-page__loading">
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description={t('notifications.empty')} />
      ) : (
        <Listy
          className="notifications-page__list"
          items={notifications}
          rowKey={(item) => item.id}
          itemRender={(item) => (
            <div
              className={
                item.read_at
                  ? 'notifications-page__item'
                  : 'notifications-page__item notifications-page__item--unread'
              }
              onClick={() => void openNotification(item)}
            >
              <div style={{ flex: 1 }}>
                <Typography.Text strong style={{ display: 'block' }}>{item.title}</Typography.Text>
                {item.body ? (
                  <Typography.Paragraph style={{ marginBottom: 8 }}>{item.body}</Typography.Paragraph>
                ) : null}
                <Typography.Text type="secondary">
                  {dayjs(item.created_at).format('DD.MM.YYYY HH:mm')}
                </Typography.Text>
              </div>
              {item.read_at && 'Прочитано'}
              <Checkbox
                checked={!!item.read_at}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!item.read_at) void onMarkRead(e, item)
                }}
                style={{ flexShrink: 0 }}
              />
            </div>
          )}
        />
      )}
    </div>
  )
}

export default NotificationsPage

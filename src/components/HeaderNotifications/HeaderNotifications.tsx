import { Badge, Button, Empty, List, Popover, Typography } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationReadMutation,
  type UserNotification,
} from '@features/notification/notificationSlice'
import './HeaderNotifications.css'

function HeaderNotifications() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { data: unreadCount = 0 } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 60_000,
  })
  const { data: notifications = [], isFetching } = useGetNotificationsQuery(2, {
    skip: !open,
  })
  const [markRead] = useMarkNotificationReadMutation()

  const openNotification = async (notification: UserNotification) => {
    if (!notification.read_at) {
      try {
        await markRead(notification.id).unwrap()
      } catch {
        // ignore mark-read errors for navigation
      }
    }
    setOpen(false)
    const link = notification.data?.link
    if (link) {
      navigate(link)
    } else {
      navigate('/notifications')
    }
  }

  const content = (
    <div className="header-notifications">
      {notifications.length === 0 && !isFetching ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('notifications.empty')} />
      ) : (
        <List
          size="small"
          loading={isFetching}
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={
                item.read_at
                  ? 'header-notifications__item'
                  : 'header-notifications__item header-notifications__item--unread'
              }
              onClick={() => void openNotification(item)}
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    {item.body ? (
                      <Typography.Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 4 }}
                      >
                        {item.body}
                      </Typography.Paragraph>
                    ) : null}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.created_at).format('DD.MM.YYYY HH:mm')}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
      <div className="header-notifications__footer">
        <Link to="/notifications" onClick={() => setOpen(false)}>
          {t('notifications.viewAll')}
        </Link>
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          aria-label={t('notifications.title')}
        />
      </Badge>
    </Popover>
  )
}

export default HeaderNotifications

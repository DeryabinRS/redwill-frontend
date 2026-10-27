import { App as AntdApp, Avatar, Button, Space, Spin } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '@config/constants'
import {
  useGetFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
} from '@features/friend/friendSlice'

function FriendRequestsSection() {
  const { message } = AntdApp.useApp()
  const { data: requests = [], isLoading } = useGetFriendRequestsQuery()
  const [acceptFriendRequest] = useAcceptFriendRequestMutation()
  const [declineFriendRequest] = useDeclineFriendRequestMutation()
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <section className="profile-shell__section" style={{ marginTop: 6 }}>
        <div className="profile-shell__section-label">{'Заявки в друзья'}</div>
        <Spin size="small" />
      </section>
    )
  }

  if (requests.length === 0) {
    return null
  }

  const handleAccept = async (userId: number) => {
    setPendingUserId(userId)
    try {
      await acceptFriendRequest(userId).unwrap()
      message.success('Заявка принята')
    } catch {
      message.error('Не удалось принять заявку')
    } finally {
      setPendingUserId(null)
    }
  }

  const handleDecline = async (userId: number) => {
    setPendingUserId(userId)
    try {
      await declineFriendRequest(userId).unwrap()
      message.success('Заявка отклонена')
    } catch {
      message.error('Не удалось отклонить заявку')
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <section className="profile-shell__section" style={{ marginTop: 6 }}>
      <div className="profile-shell__section-label">{'Заявки в друзья'}</div>
      <div className="friend-requests-list">
        {requests.map((request) => {
          const label = request.user.nick_name?.trim() || request.user.login
          const avatarSrc = request.user.avatar ? `${API_URL}${request.user.avatar}` : undefined
          const busy = pendingUserId === request.user.id

          return (
            <div key={request.id} className="friend-request-card">
              <Link to={`/users/${request.user.id}`}>
                <Avatar src={avatarSrc} size={44}>
                  {avatarSrc ? null : label.slice(0, 1).toUpperCase()}
                </Avatar>
              </Link>
              <Link to={`/users/${request.user.id}`} className="friend-request-card__name">
                {label}
              </Link>
              <Space size={8}>
                <Button
                  type="primary"
                  size="small"
                  loading={busy}
                  disabled={busy}
                  onClick={() => void handleAccept(request.user.id)}
                >
                  Принять
                </Button>
                <Button
                  danger
                  size="small"
                  loading={busy}
                  disabled={busy}
                  onClick={() => void handleDecline(request.user.id)}
                >
                  Отклонить
                </Button>
              </Space>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default FriendRequestsSection

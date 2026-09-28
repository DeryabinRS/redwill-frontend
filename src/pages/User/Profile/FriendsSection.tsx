import { App as AntdApp, Avatar, Button, List, Modal, Popconfirm, Spin, Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetUserFriendsQuery, useRemoveFriendMutation } from '@features/friend/friendSlice'

const MAX_VISIBLE_FRIENDS = 10

type FriendsSectionProps = {
  userId: number
}

function FriendsSection({ userId }: FriendsSectionProps) {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const [open, setOpen] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const { data: friends = [], isLoading } = useGetUserFriendsQuery(userId)
  const [removeFriend] = useRemoveFriendMutation()

  const handleRemove = async (friendId: number) => {
    setRemovingId(friendId)
    try {
      await removeFriend(friendId).unwrap()
      message.success(t('profile.friendRemoved'))
    } catch {
      message.error(t('profile.friendRemoveError'))
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <section className="profile-shell__section">
        <div className="profile-shell__section-label">{t('profile.friends')}</div>
        <Spin size="small" />
      </section>
    )
  }

  if (friends.length === 0) {
    return null
  }

  const visibleFriends = friends.slice(0, MAX_VISIBLE_FRIENDS)
  const hiddenCount = friends.length - visibleFriends.length

  return (
    <section className="profile-shell__section" style={{ marginTop: 6 }}>
      <div className="profile-shell__section-label">{t('profile.friends')}</div>
      <div className="friends-list">
        {visibleFriends.map((friend) => {
          const avatarSrc = friend.avatar ? `${API_URL}${friend.avatar}` : undefined
          const label = friend.nick_name?.trim() || friend.login

          return (
            <div key={friend.id} className="friends-list__item">
              <Tooltip title={label}>
                <Link to={`/users/${friend.id}`}>
                  <Avatar src={avatarSrc} size={40}>
                    {avatarSrc ? null : label.slice(0, 1).toUpperCase()}
                  </Avatar>
                </Link>
              </Tooltip>
              <Popconfirm
                title={t('profile.friendRemoveConfirmTitle')}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: removingId === friend.id }}
                onConfirm={() => void handleRemove(friend.id)}
              >
                <button
                  type="button"
                  className="friends-list__remove"
                  aria-label={t('profile.removeFriend')}
                >
                  <CloseOutlined />
                </button>
              </Popconfirm>
            </div>
          )
        })}
        {hiddenCount > 0 && (
          <button
            type="button"
            className="friends-list__more"
            aria-label={t('profile.friends')}
            onClick={() => setOpen(true)}
          >
            +{hiddenCount}
          </button>
        )}
      </div>

      <Modal
        title={t('profile.friends')}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <List
          dataSource={friends}
          renderItem={(friend) => {
            const avatarSrc = friend.avatar ? `${API_URL}${friend.avatar}` : undefined
            const label = friend.nick_name?.trim() || friend.login

            return (
              <List.Item
                actions={[
                  <Popconfirm
                    key="remove"
                    title={t('profile.friendRemoveConfirmTitle')}
                    okText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    okButtonProps={{ danger: true, loading: removingId === friend.id }}
                    onConfirm={() => void handleRemove(friend.id)}
                  >
                    <Button danger size="small">
                      {t('profile.removeFriend')}
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={avatarSrc}>{avatarSrc ? null : label.slice(0, 1).toUpperCase()}</Avatar>
                  }
                  title={<Link to={`/users/${friend.id}`}>{label}</Link>}
                />
              </List.Item>
            )
          }}
        />
      </Modal>
    </section>
  )
}

export default FriendsSection

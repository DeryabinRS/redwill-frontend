import { Avatar, List, Modal, Spin, Tooltip } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetUserFriendsQuery } from '@features/friend/friendSlice'

const MAX_VISIBLE_FRIENDS = 10

type FriendsSectionProps = {
  userId: number
}

function FriendsSection({ userId }: FriendsSectionProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: friends = [], isLoading } = useGetUserFriendsQuery(userId)

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
    <section className="profile-shell__section">
      <div className="profile-shell__section-label">{t('profile.friends')}</div>
      <div className="friends-list">
        {visibleFriends.map((friend) => {
          const avatarSrc = friend.avatar ? `${API_URL}${friend.avatar}` : undefined
          const label = friend.nick_name?.trim() || friend.login

          return (
            <Tooltip key={friend.id} title={label}>
              <Link to={`/users/${friend.id}`}>
                <Avatar src={avatarSrc} size={40}>
                  {avatarSrc ? null : label.slice(0, 1).toUpperCase()}
                </Avatar>
              </Link>
            </Tooltip>
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
              <List.Item>
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

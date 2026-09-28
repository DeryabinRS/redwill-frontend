import { App as AntdApp, Button, Card, Spin, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_URL } from '@config/constants'
import { useGetPublicUserProfileQuery, useGetUserInfoQuery } from '@features/user/userSlice'
import { useGetPublicJoinedMotoclubsQuery } from '@features/motoclub/motoclubSlice'
import { useGetPublicUserMotorcyclesQuery } from '@features/motorcycle/motorcycleSlice'
import { useAddFriendMutation, useRemoveFriendMutation } from '@features/friend/friendSlice'
import { ProfilePersonalForm } from './ProfilePersonalForm'
import './Profile.css'
import '../JoinedMotoclubs/JoinedMotoclubs.css'

function PublicProfile() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const isValidId = Number.isFinite(userId) && userId > 0

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useGetPublicUserProfileQuery(userId, {
    skip: !isValidId,
  })

  const {
    data: joinedData,
    isLoading: isLoadingMotoclubs,
  } = useGetPublicJoinedMotoclubsQuery(
    { userId, pagination: { page: 1, per_page: 100 } },
    { skip: !isValidId },
  )

  const {
    data: motorcycles = [],
    isLoading: isLoadingMotorcycles,
  } = useGetPublicUserMotorcyclesQuery(userId, {
    skip: !isValidId,
  })

  const { data: currentUser } = useGetUserInfoQuery()
  const { message } = AntdApp.useApp()
  const [addFriend, { isLoading: isAddingFriend }] = useAddFriendMutation()
  const [removeFriend, { isLoading: isRemovingFriend }] = useRemoveFriendMutation()
  const [isFriend, setIsFriend] = useState(false)

  useEffect(() => {
    setIsFriend(Boolean(userInfo?.is_friend))
  }, [userInfo])

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !userInfo) {
    return (
      <Card size="small">
        <Typography.Title level={4}>{t('profile.loadError')}</Typography.Title>
      </Card>
    )
  }

  const fullName = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ').trim()
  const displayName = fullName || userInfo.nick_name?.trim() || userInfo.login
  const handleLabel = userInfo.nick_name?.trim()
    ? `@${userInfo.nick_name.trim()}`
    : userInfo.login
  const avatarSrc = userInfo.avatar ? `${API_URL}${userInfo.avatar}` : null
  const motoclubs = joinedData?.data || []
  const isOwnProfile = currentUser?.id === userId

  const handleToggleFriend = async () => {
    try {
      if (isFriend) {
        await removeFriend(userId).unwrap()
        setIsFriend(false)
        message.success(t('profile.friendRemoved'))
      } else {
        await addFriend(userId).unwrap()
        setIsFriend(true)
        message.success(t('profile.friendAdded'))
      }
    } catch {
      message.error(isFriend ? t('profile.friendRemoveError') : t('profile.friendAddError'))
    }
  }

  return (
    <div className="container profile-page">
      <section className="profile-shell" aria-label={t('profile.title')}>
        <div className="profile-shell__inner">
          <header className="profile-shell__masthead">
            <div>
              <span className="profile-shell__eyebrow">{t('profile.title')}</span>
              <h1 className="profile-shell__name">{userInfo.login}</h1>
              <p className="profile-shell__handle">{handleLabel}</p>
            </div>
            <div className="profile-shell__meta">
              {!isOwnProfile && (
                <Button
                  type={isFriend ? 'default' : 'primary'}
                  danger={isFriend}
                  loading={isAddingFriend || isRemovingFriend}
                  onClick={() => void handleToggleFriend()}
                >
                  {isFriend ? t('profile.removeFriend') : t('profile.addFriend')}
                </Button>
              )}
              {userInfo.roles?.length
                ? userInfo.roles.slice(0, 2).map((role) => (
                    <span key={role} className="profile-shell__chip profile-shell__chip--accent">
                      {role}
                    </span>
                  ))
                : (
                    <span className="profile-shell__chip">ID {userInfo.id}</span>
                  )}
            </div>
          </header>

          <div className="profile-shell__body">
            <aside className="profile-shell__bay">
              <div className="profile-shell__avatar-stack">
                <div className="profile-shell__avatar-ring">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      style={{
                        borderRadius: '50%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        borderRadius: '50%',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#101012',
                        color: '#9a9a96',
                        fontSize: 48,
                        fontWeight: 600,
                      }}
                    >
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <div className="profile-shell__dossier">
              <ProfilePersonalForm
                userInfo={userInfo}
                displayName={displayName}
                handleLabel={handleLabel}
                readOnly
              />
            </div>

            <div className="profile-shell__identity">
              <section className="profile-shell__section">
                <div className="profile-shell__section-label">{t('profile.motoclubs')}</div>
                {isLoadingMotoclubs ? (
                  <Spin size="small" />
                ) : motoclubs.length === 0 ? (
                  <p className="profile-shell__empty">{t('profile.motoclubEmpty')}</p>
                ) : (
                  <div className="joined-motoclubs-grid">
                    {motoclubs.map((club) => {
                      const logoSrc = club.logo ? `${API_URL}${club.logo}` : null
                      const isPublished = club.publication_status === 1 && club.moderation_status === 2

                      const tile = (
                        <div className="joined-motoclub-tile" style={isPublished ? undefined : { cursor: 'default' }}>
                          {logoSrc ? (
                            <img src={logoSrc} alt={club.name} className="joined-motoclub-tile__logo" />
                          ) : (
                            <div className="joined-motoclub-tile__placeholder">{club.name}</div>
                          )}
                        </div>
                      )

                      return (
                        <div
                          key={club.id}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                        >
                          {isPublished ? (
                            <Link to={`/motoclubs/${club.id}`} title={club.name}>
                              {tile}
                            </Link>
                          ) : (
                            tile
                          )}
                          <span
                            style={{
                              maxWidth: 88,
                              fontSize: 12,
                              color: 'var(--profile-muted)',
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {club.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="profile-shell__section">
                <div className="profile-shell__section-label">{t('profile.motorcycles')}</div>
                {isLoadingMotorcycles ? (
                  <Spin size="small" />
                ) : motorcycles.length === 0 ? (
                  <p className="profile-shell__empty">{t('profile.motorcycleEmpty')}</p>
                ) : (
                  <div className="profile-motorcycles-list">
                    {motorcycles.map((m) => (
                      <div key={m.id} className="profile-motorcycle-item">
                        <div>
                          <div className="profile-motorcycle-item__title">
                            {m.make_name} {m.model_name}
                          </div>
                          {m.mileage != null ? (
                            <div className="profile-motorcycle-item__meta">
                              {t('profile.motorcycleMileage')}: {m.mileage.toLocaleString('ru-RU')}{' '}
                              {t('profile.motorcycleMileageUnit')}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PublicProfile

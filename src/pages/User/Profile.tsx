import { App as AntdApp, Button, Card, Spin, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ImageCropper from '@components/ImageCropper/ImageCropper'
import { API_URL } from '@config/constants'
import {
  useDeleteUserAvatarMutation,
  useGetUserInfoQuery,
  useUploadUserAvatarMutation,
} from '@features/user/userSlice'
import { base64ToFile, logoDataUrlToFileName } from '@utils/form'
import UserPosts from './Posts'
import UserMotoclubs from './Motoclubs'
import ProfilePersonalForm from './ProfilePersonalForm'
import ProfileJoinedMotoclubs from './ProfileJoinedMotoclubs'
import './Profile.css'
import UserMotobars from './Motobars'
import UserServiceStations from './ServiceStations'

function Profile() {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const { data: userInfo, isLoading } = useGetUserInfoQuery()
  const [uploadUserAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarMutation()
  const [deleteUserAvatar, { isLoading: isDeletingAvatar }] = useDeleteUserAvatarMutation()
  const [previewAvatar, setPreviewAvatar] = useState('')
  const [pendingAvatar, setPendingAvatar] = useState('')

  const cropperValue = pendingAvatar || previewAvatar
  const hasNewAvatarToUpload = pendingAvatar.startsWith('data:image')
  const isAvatarBusy = isUploadingAvatar || isDeletingAvatar
  const showAvatarSave = hasNewAvatarToUpload && !isAvatarBusy

  useEffect(() => {
    if (!userInfo) return
    setPreviewAvatar(userInfo.avatar ? `${API_URL}${userInfo.avatar}` : '')
    setPendingAvatar('')
  }, [userInfo])

  const onAvatarSubmit = async () => {
    if (!hasNewAvatarToUpload) {
      message.warning(t('profile.avatarSelectWarning'))
      return
    }

    try {
      const file = await base64ToFile(pendingAvatar, logoDataUrlToFileName('avatar'))
      if (!file) {
        message.error(t('profile.avatarPrepareError'))
        return
      }

      const formData = new FormData()
      formData.append('avatar', file)
      const result = await uploadUserAvatar(formData).unwrap()

      message.success(t('profile.avatarUpdated'))
      if (result.avatar) {
        const path = result.avatar.includes('?') ? result.avatar : `${result.avatar}?v=${Date.now()}`
        setPreviewAvatar(`${API_URL}${path}`)
      }
      setPendingAvatar('')
    } catch {
      message.error(t('profile.avatarUpdateError'))
    }
  }

  const onAvatarChange = async (value: string) => {
    if (value.startsWith('data:image')) {
      setPendingAvatar(value)
      return
    }

    setPendingAvatar('')
    if (value) return

    // Сразу очищаем превью, иначе ImageCropper вернёт старый value
    const previousPreview = previewAvatar
    setPreviewAvatar('')

    if (!userInfo?.avatar) return

    try {
      await deleteUserAvatar().unwrap()
      message.success(t('profile.avatarDeleted'))
    } catch {
      message.error(t('profile.avatarDeleteError'))
      setPreviewAvatar(previousPreview)
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!userInfo) {
    return (
      <Card size="small">
        <Typography.Title level={4}>{t('profile.title')}</Typography.Title>
        <Typography.Text>{t('profile.loadError')}</Typography.Text>
      </Card>
    )
  }

  const fullName = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ').trim()
  const displayName = fullName || userInfo.nick_name?.trim() || userInfo.login
  const handleLabel = userInfo.nick_name?.trim()
    ? `@${userInfo.nick_name.trim()}`
    : userInfo.login
  const city = userInfo.city?.trim()

  return (
    <div className="container profile-page">
      <section className="profile-shell" aria-label={t('profile.title')}>
        <div className="profile-shell__inner">
          <header className="profile-shell__masthead">
            <div>
              <span className="profile-shell__eyebrow">{t('profile.title')}</span>
              <h1 className="profile-shell__name">{userInfo.login}</h1>
              <p className="profile-shell__handle">{userInfo.email}</p>
            </div>
            <div className="profile-shell__meta">
              {city ? <span className="profile-shell__chip">{city}</span> : null}
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
                  <ImageCropper
                    value={cropperValue}
                    onChange={(value) => void onAvatarChange(value)}
                    aspectRatio={1}
                    outputSize={{ width: 250, height: 250 }}
                    showOrientationSwitch={false}
                    cropInModal
                  />
                </div>
                {showAvatarSave ? (
                  <Button
                    className="profile-shell__save"
                    type="primary"
                    htmlType="button"
                    onClick={() => void onAvatarSubmit()}
                    block
                  >
                    {t('profile.avatarSave')}
                  </Button>
                ) : null}
              </div>
            </aside>

            <div className="profile-shell__dossier">
              <ProfilePersonalForm
                userInfo={userInfo}
                displayName={displayName}
                handleLabel={handleLabel}
              />
            </div>

            <div className="profile-shell__identity">
              <ProfileJoinedMotoclubs userId={userInfo.id} />
            </div>
          </div>
        </div>
      </section>

      <div className="profile-page__lists">
        <UserPosts />
        <UserMotoclubs />
        <UserMotobars />
        <UserServiceStations />
      </div>
    </div>
  )
}

export default Profile

import { App as AntdApp, Button, Card, Col, Row, Space, Spin, Typography } from 'antd'
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
import UserJoinedMotoclubs from './JoinedMotoclubs'
import UserMotobars from './Motobars'
import UserMotoPosts from './MotoPosts'
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
  const hasNewAvatarToUpload = Boolean(pendingAvatar && pendingAvatar.startsWith('data:image'))
  const hasSavedAvatar = Boolean(userInfo?.avatar)

  useEffect(() => {
    if (!userInfo) return
    if (userInfo.avatar) {
      setPreviewAvatar(`${API_URL}${userInfo.avatar}`)
      setPendingAvatar('')
    } else {
      setPreviewAvatar('')
      setPendingAvatar('')
    }
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

    // Удаление: новый несохранённый файл — только локально; сохранённый — на сервере
    if (!hasSavedAvatar) return

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

  return (
    <div className="container" style={{ marginTop: 8 }}>
      <Card size="small">
        <Typography.Title level={4}>{t('profile.title')}</Typography.Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={10} md={8} lg={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Typography.Text strong>{t('profile.avatar')}</Typography.Text>
              <ImageCropper
                value={cropperValue}
                onChange={(value) => void onAvatarChange(value)}
                aspectRatio={1}
                outputSize={{ width: 250, height: 250 }}
                showOrientationSwitch={false}
              />
              <Button
                type="primary"
                htmlType="button"
                loading={isUploadingAvatar || isDeletingAvatar}
                disabled={!hasNewAvatarToUpload || isUploadingAvatar || isDeletingAvatar}
                onClick={() => void onAvatarSubmit()}
                block
              >
                {t('profile.avatarSave')}
              </Button>
            </Space>
          </Col>

          <Col xs={24} sm={14} md={16} lg={18}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary">{t('profile.login')}</Typography.Text>
                <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                  {userInfo.login}
                </Typography.Title>
              </div>
              <div>
                <Typography.Text type="secondary">{t('profile.email')}</Typography.Text>
                <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
                  {userInfo.email}
                </Typography.Title>
              </div>
              <UserJoinedMotoclubs />
            </Space>
          </Col>
        </Row>
      </Card>

      <UserPosts />
      <UserMotoclubs />
      <UserMotobars />
      <UserMotoPosts />
      <UserServiceStations />
    </div>
  )
}

export default Profile

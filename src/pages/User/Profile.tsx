import { App as AntdApp, Button, Card, Col, Popconfirm, Row, Space, Spin, Tooltip, Typography } from 'antd'
import { CheckCircleFilled, CloseOutlined, ClockCircleFilled, CrownFilled } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ImageCropper from '@components/ImageCropper/ImageCropper'
import { API_URL } from '@config/constants'
import {
  useDeleteUserAvatarMutation,
  useGetUserInfoQuery,
  useUploadUserAvatarMutation,
} from '@features/user/userSlice'
import {
  useGetJoinedMotoclubsQuery,
  useLeaveMotoclubMutation,
} from '@features/motoclub/motoclubSlice'
import { base64ToFile, logoDataUrlToFileName } from '@utils/form'
import UserPosts from './Posts'
import UserMotoclubs from './Motoclubs'
import UserJoinedMotoclubs from './JoinedMotoclubs'
// import UserMotobars from './Motobars'
// import UserMotoPosts from './MotoPosts'
// import UserServiceStations from './ServiceStations'
import './JoinedMotoclubs/JoinedMotoclubs.css'

function Profile() {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { data: userInfo, isLoading } = useGetUserInfoQuery()
  const { data: joinedData, isLoading: joinedLoading } = useGetJoinedMotoclubsQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const [uploadUserAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarMutation()
  const [deleteUserAvatar, { isLoading: isDeletingAvatar }] = useDeleteUserAvatarMutation()
  const [leaveMotoclub] = useLeaveMotoclubMutation()
  const [previewAvatar, setPreviewAvatar] = useState('')
  const [pendingAvatar, setPendingAvatar] = useState('')
  const [leavingId, setLeavingId] = useState<number | null>(null)

  const cropperValue = pendingAvatar || previewAvatar
  const hasNewAvatarToUpload = Boolean(pendingAvatar && pendingAvatar.startsWith('data:image'))
  const hasSavedAvatar = Boolean(userInfo?.avatar)
  const joinedList = joinedData?.data || []

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

  const onLeaveMotoclub = async (motoclubId: number) => {
    setLeavingId(motoclubId)
    try {
      await leaveMotoclub(motoclubId).unwrap()
      message.success(t('profile.motoclubLeft'))
    } catch {
      message.error(t('profile.motoclubLeaveError'))
    } finally {
      setLeavingId(null)
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
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={10} md={8} lg={5}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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

          <Col xs={24} sm={14} md={16} lg={19}>
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
              <div>
                <Typography.Text type="secondary">{t('profile.motoclub')}</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  {joinedLoading ? (
                    <Spin size="small" />
                  ) : joinedList.length === 0 ? (
                    <Typography.Text type="secondary">{t('profile.motoclubEmpty')}</Typography.Text>
                  ) : (
                    <div className="joined-motoclubs-grid">
                      {joinedList.map((motoclub) => {
                        const logoSrc = motoclub.logo ? `${API_URL}${motoclub.logo}` : null
                        const isOwner = motoclub.user_id != null && motoclub.user_id === userInfo.id
                        const isClubAdmin = Number(motoclub.pivot?.is_admin) === 1
                        const isPending = motoclub.pivot?.verified == null
                        const membershipTitle = isPending
                          ? t('profile.motoclubPending')
                          : t('profile.motoclubMember')

                        const canLeave =
                          !isOwner ||
                          (motoclub.members_count ?? 0) <= 1 ||
                          (motoclub.admins_count ?? 0) > 1
                        const removeTitle = canLeave
                          ? t('profile.motoclubRemove')
                          : t('profile.motoclubLeaveAsAdminBlocked')

                        return (
                          <div
                            key={motoclub.id}
                            className="joined-motoclub-tile"
                            role="button"
                            tabIndex={0}
                            title={motoclub.name}
                            onClick={() => navigate(`/motoclubs/${motoclub.id}`)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                navigate(`/motoclubs/${motoclub.id}`)
                              }
                            }}
                          >
                            {logoSrc ? (
                              <img
                                src={logoSrc}
                                alt={motoclub.name}
                                className="joined-motoclub-tile__logo"
                              />
                            ) : (
                              <div className="joined-motoclub-tile__placeholder">{motoclub.name}</div>
                            )}

                            <div className="joined-motoclub-tile__badges">
                              <Tooltip title={membershipTitle}>
                                <span
                                  className={
                                    isPending
                                      ? 'joined-motoclub-tile__status joined-motoclub-tile__status--pending'
                                      : 'joined-motoclub-tile__status joined-motoclub-tile__status--member'
                                  }
                                  aria-label={membershipTitle}
                                >
                                  {isPending ? <ClockCircleFilled /> : <CheckCircleFilled />}
                                </span>
                              </Tooltip>
                              {isClubAdmin ? (
                                <Tooltip title={t('profile.motoclubAdmin')}>
                                  <span
                                    className="joined-motoclub-tile__status joined-motoclub-tile__status--admin"
                                    aria-label={t('profile.motoclubAdmin')}
                                  >
                                    <CrownFilled />
                                  </span>
                                </Tooltip>
                              ) : null}
                            </div>

                            <Tooltip title={removeTitle}>
                              <span
                                className="joined-motoclub-tile__remove-wrap"
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                              >
                                <Popconfirm
                                  title={t('profile.motoclubLeaveConfirmTitle')}
                                  description={t('profile.motoclubLeaveConfirmDesc')}
                                  okText={t('profile.motoclubLeaveConfirmOk')}
                                  cancelText={t('common.cancel')}
                                  okButtonProps={{ danger: true, loading: leavingId === motoclub.id }}
                                  disabled={!canLeave || leavingId === motoclub.id}
                                  onConfirm={() => void onLeaveMotoclub(motoclub.id)}
                                >
                                  <button
                                    type="button"
                                    className="joined-motoclub-tile__remove"
                                    aria-label={removeTitle}
                                    disabled={!canLeave || leavingId === motoclub.id}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <CloseOutlined />
                                  </button>
                                </Popconfirm>
                              </span>
                            </Tooltip>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <UserJoinedMotoclubs />
            </Space>
          </Col>
        </Row>
      </Card>

      <UserPosts />
      <UserMotoclubs />
      {/* <UserMotobars /> */}
      {/* <UserMotoPosts /> */}
      {/* <UserServiceStations /> */}
    </div>
  )
}

export default Profile

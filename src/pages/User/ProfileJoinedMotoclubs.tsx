import { App as AntdApp, Button, Flex, Modal, Popconfirm, Spin, Tooltip, Typography } from 'antd'
import {
  CheckCircleFilled,
  CloseOutlined,
  ClockCircleFilled,
  CrownFilled,
  PlusOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_URL } from '@config/constants'
import {
  useGetJoinedMotoclubsQuery,
  useLeaveMotoclubMutation,
} from '@features/motoclub/motoclubSlice'
import UserJoinedMotoclubs from './JoinedMotoclubs'
import './JoinedMotoclubs/JoinedMotoclubs.css'

type ProfileJoinedMotoclubsProps = {
  userId: number
}

function ProfileJoinedMotoclubs({ userId }: ProfileJoinedMotoclubsProps) {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { data: joinedData, isLoading } = useGetJoinedMotoclubsQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const [leaveMotoclub] = useLeaveMotoclubMutation()
  const [leavingId, setLeavingId] = useState<number | null>(null)
  const [joinOpen, setJoinOpen] = useState(false)

  const joinedList = joinedData?.data || []

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

  return (
    <div>
      <Flex align="center" gap="small" style={{ marginBottom: 8 }}>
        <Typography.Text type="secondary">{t('profile.motoclub')}</Typography.Text>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          aria-label={t('profile.motoclubJoin')}
          title={t('profile.motoclubJoin')}
          onClick={() => setJoinOpen(true)}
        />
      </Flex>

      {isLoading ? (
        <Spin size="small" />
      ) : joinedList.length === 0 ? (
        <Typography.Text type="secondary">{t('profile.motoclubEmpty')}</Typography.Text>
      ) : (
        <div className="joined-motoclubs-grid">
          {joinedList.map((motoclub) => {
            const logoSrc = motoclub.logo ? `${API_URL}${motoclub.logo}` : null
            const isOwner = motoclub.user_id != null && motoclub.user_id === userId
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
                  <img src={logoSrc} alt={motoclub.name} className="joined-motoclub-tile__logo" />
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

      <Modal
        title={t('profile.motoclubJoin')}
        open={joinOpen}
        onCancel={() => setJoinOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <UserJoinedMotoclubs onJoined={() => setJoinOpen(false)} />
      </Modal>
    </div>
  )
}

export default ProfileJoinedMotoclubs

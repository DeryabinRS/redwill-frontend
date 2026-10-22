import { App as AntdApp, Button, Modal, Popconfirm, Spin, Tooltip } from 'antd'
import {
  CheckCircleFilled,
  CloseOutlined,
  ClockCircleFilled,
  CrownFilled,
  PlusOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '@config/constants'
import {
  useGetJoinedMotoclubsQuery,
  useLeaveMotoclubMutation,
} from '@features/motoclub/motoclubSlice'
import UserJoinedMotoclubs from '../JoinedMotoclubs'
import '../JoinedMotoclubs/JoinedMotoclubs.css'

const MAX_JOINED_MOTOCLUBS = 2

type ProfileJoinedMotoclubsProps = {
  userId: number
}

function ProfileJoinedMotoclubs({ userId }: ProfileJoinedMotoclubsProps) {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { data: joinedData, isLoading } = useGetJoinedMotoclubsQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const [leaveMotoclub] = useLeaveMotoclubMutation()
  const [leavingId, setLeavingId] = useState<number | null>(null)
  const [joinOpen, setJoinOpen] = useState(false)

  const joinedList = joinedData?.data || []
  const canJoinMore = joinedList.length < MAX_JOINED_MOTOCLUBS

  const onOpenJoin = () => {
    if (!canJoinMore) {
      message.warning('Можно состоять не более чем в двух мотоклубах')
      return
    }
    setJoinOpen(true)
  }

  const onLeaveMotoclub = async (motoclubId: number) => {
    setLeavingId(motoclubId)
    try {
      await leaveMotoclub(motoclubId).unwrap()
      message.success('Вы вышли из мотоклуба')
    } catch {
      message.error('Не удалось выйти из мотоклуба')
    } finally {
      setLeavingId(null)
    }
  }

  return (
    <section className="profile-shell__section">
      <div className="profile-shell__section-label">
        {'Мотоклубы'}
        <Button
          size="small"
          icon={<PlusOutlined />}
          aria-label={'Вступить в мотоклуб'}
          title={canJoinMore ? 'Вступить в мотоклуб' : 'Можно состоять не более чем в двух мотоклубах'}
          onClick={onOpenJoin}
          disabled={!canJoinMore}
          style={{ marginLeft: 4 }}
        />
      </div>

      {isLoading ? (
        <Spin size="small" />
      ) : joinedList.length === 0 ? (
        <p className="profile-shell__empty">{'Вы пока не состоите в мотоклубах'}</p>
      ) : (
        <div className="joined-motoclubs-grid">
          {joinedList.map((motoclub) => {
            const logoSrc = motoclub.logo ? `${API_URL}${motoclub.logo}` : null
            const isOwner = motoclub.user_id != null && motoclub.user_id === userId
            const isClubAdmin = Number(motoclub.pivot?.is_admin) === 1
            const isPending = motoclub.pivot?.verified == null
            const membershipTitle = isPending
              ? 'Подана заявка'
              : 'Участник'

            const canLeave =
              !isOwner ||
              (motoclub.members_count ?? 0) <= 1 ||
              (motoclub.admins_count ?? 0) > 1
            const removeTitle = canLeave
              ? 'Выйти из мотоклуба'
              : 'Назначьте другого администратора в «Участники», чтобы выйти из клуба'

            return (
              <div
                key={motoclub.id}
                className="joined-motoclub-tile"
                role="button"
                tabIndex={0}
                title={motoclub.name}
                onClick={() => navigate(`/motoclubs/${motoclub.slug}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/motoclubs/${motoclub.slug}`)
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
                    <Tooltip title={'Администратор'}>
                      <span
                        className="joined-motoclub-tile__status joined-motoclub-tile__status--admin"
                        aria-label={'Администратор'}
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
                      title={'Выйти из мотоклуба?'}
                      description={'Вы перестанете быть участником этого клуба'}
                      okText={'Выйти'}
                      cancelText={'Отмена'}
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
        title={'Вступить в мотоклуб'}
        open={joinOpen}
        onCancel={() => setJoinOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <UserJoinedMotoclubs onJoined={() => setJoinOpen(false)} />
      </Modal>
    </section>
  )
}

export default ProfileJoinedMotoclubs

import { Avatar, Button, Modal, Space } from 'antd'
import { CheckOutlined, TeamOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { isAuthenticated } from '@utils/auth'
import {
  useGetRsvpQuery,
  useSetRsvpMutation,
  useRemoveRsvpMutation,
  type RsvpStatus,
} from '@features/rsvp/rsvpSlice'

type RsvpPanelProps = {
  postId: number
}

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'going', label: 'Пойду' },
  { value: 'maybe', label: 'Возможно' },
  { value: 'declined', label: 'Не пойду' },
]

function RsvpPanel({ postId }: RsvpPanelProps) {
  const navigate = useNavigate()
  const { data: rsvp } = useGetRsvpQuery(postId)
  const [setRsvp, { isLoading: isSetting }] = useSetRsvpMutation()
  const [removeRsvp, { isLoading: isRemoving }] = useRemoveRsvpMutation()
  const [participantsOpen, setParticipantsOpen] = useState(false)

  const counts = rsvp?.counts ?? { going: 0, maybe: 0, declined: 0 }
  const myRsvp = rsvp?.my_rsvp ?? null
  const participants = rsvp?.participants?.data ?? []
  const totalParticipants = rsvp?.participants?.total ?? 0

  const isBusy = isSetting || isRemoving

  const handleSelect = async (status: RsvpStatus) => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    try {
      if (myRsvp === status) {
        await removeRsvp(postId).unwrap()
      } else {
        await setRsvp({ postId, status }).unwrap()
      }
    } catch {
      // 401/сеть обрабатываются в baseQuery
    }
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      <Space size={8} wrap>
        {STATUS_OPTIONS.map((option) => {
          const selected = myRsvp === option.value

          return (
            <Button
              key={option.value}
              type={selected ? 'primary' : 'default'}
              icon={selected ? <CheckOutlined /> : undefined}
              loading={isBusy}
              disabled={isBusy}
              onClick={() => void handleSelect(option.value)}
            >
              {option.label} · {counts[option.value]}
            </Button>
          )
        })}
        {totalParticipants > 0 && (
          <Button
            icon={<TeamOutlined />}
            onClick={() => setParticipantsOpen(true)}
          />
        )}
      </Space>


      <Modal
        title="Подписка на мероприятие"
        open={participantsOpen}
        onCancel={() => setParticipantsOpen(false)}
        footer={null}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {participants.map((participant) => {
            if (!participant.user) return null
            const label = participant.user.nick_name?.trim() || participant.user.login
            const avatarSrc = participant.user.avatar
              ? `${API_URL}${participant.user.avatar}`
              : undefined

            return (
              <Link
                key={participant.id}
                to={`/users/${participant.user.id}`}
                onClick={() => setParticipantsOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}
              >
                <Avatar src={avatarSrc}>
                  {avatarSrc ? null : label.slice(0, 1).toUpperCase()}
                </Avatar>
                <span>{label}</span>
              </Link>
            )
          })}
        </Space>
      </Modal>
    </Space>
  )
}

export default RsvpPanel

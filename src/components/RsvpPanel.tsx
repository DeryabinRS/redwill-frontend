import { Avatar, Button, Space, Tooltip, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { isAuthenticated } from '@utils/auth'
import {
  useGetRsvpQuery,
  useSetRsvpMutation,
  useRemoveRsvpMutation,
  type RsvpStatus,
} from '@features/rsvp/rsvpSlice'

const { Text } = Typography

type RsvpPanelProps = {
  postId: number
}

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'going', label: 'Пойду' },
  { value: 'maybe', label: 'Возможно' },
  { value: 'declined', label: 'Не пойду' },
]

const MAX_VISIBLE_PARTICIPANTS = 8

function RsvpPanel({ postId }: RsvpPanelProps) {
  const navigate = useNavigate()
  const { data: rsvp } = useGetRsvpQuery(postId)
  const [setRsvp, { isLoading: isSetting }] = useSetRsvpMutation()
  const [removeRsvp, { isLoading: isRemoving }] = useRemoveRsvpMutation()

  const counts = rsvp?.counts ?? { going: 0, maybe: 0, declined: 0 }
  const myRsvp = rsvp?.my_rsvp ?? null
  const participants = rsvp?.participants?.data ?? []
  const totalParticipants = rsvp?.participants?.total ?? 0

  const visibleParticipants = participants.slice(0, MAX_VISIBLE_PARTICIPANTS)
  const hiddenCount = Math.max(0, totalParticipants - visibleParticipants.length)

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
      </Space>

      {visibleParticipants.length > 0 && (
        <Space size={4} align="center" wrap>
          {visibleParticipants.map((participant) => {
            if (!participant.user) return null
            const label = participant.user.nick_name?.trim() || participant.user.login
            const avatarSrc = participant.user.avatar
              ? `${API_URL}${participant.user.avatar}`
              : undefined

            return (
              <Tooltip key={participant.id} title={label}>
                <Link to={`/users/${participant.user.id}`}>
                  <Avatar src={avatarSrc} size="small">
                    {avatarSrc ? null : label.slice(0, 1).toUpperCase()}
                  </Avatar>
                </Link>
              </Tooltip>
            )
          })}
          {hiddenCount > 0 && <Text type="secondary">+{hiddenCount}</Text>}
        </Space>
      )}
    </Space>
  )
}

export default RsvpPanel

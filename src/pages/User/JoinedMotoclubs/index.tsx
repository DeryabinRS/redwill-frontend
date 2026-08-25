import { App as AntdApp, Button, Card, Select, Space, Spin, Tooltip, Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, type MouseEvent } from 'react'
import { API_URL } from '@config/constants'
import {
  useGetJoinedMotoclubsQuery,
  useGetMotoclubListQuery,
  useJoinMotoclubMutation,
  useLeaveMotoclubMutation,
} from '@features/motoclub/motoclubSlice'
import './JoinedMotoclubs.css'

function UserJoinedMotoclubs() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [selectedMotoclubId, setSelectedMotoclubId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [leavingId, setLeavingId] = useState<number | null>(null)

  const { data: joinedData, isLoading: joinedLoading } = useGetJoinedMotoclubsQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: motoclubsData, isFetching: motoclubsLoading } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 50 },
    search,
  })
  const [joinMotoclub, { isLoading: isJoining }] = useJoinMotoclubMutation()
  const [leaveMotoclub] = useLeaveMotoclubMutation()

  const joinedList = joinedData?.data || []

  const joinedIds = useMemo(
    () => new Set(joinedList.map((item) => item.id)),
    [joinedList],
  )

  const options = (motoclubsData?.data || [])
    .filter((item) => !joinedIds.has(item.id))
    .map((item) => ({
      value: item.id,
      label: item.address ? `${item.name} (${item.address})` : item.name,
    }))

  const onJoin = async () => {
    if (!selectedMotoclubId) {
      message.warning('Выберите мотоклуб')
      return
    }

    try {
      await joinMotoclub(selectedMotoclubId).unwrap()
      message.success('Вы вступили в мотоклуб')
      setSelectedMotoclubId(null)
    } catch {
      message.error('Не удалось вступить в мотоклуб')
    }
  }

  const onLeave = async (event: MouseEvent, motoclubId: number) => {
    event.stopPropagation()
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
    <Card size="small" style={{ marginTop: 8 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Членство в мотоклубах
      </Typography.Title>

      <Space.Compact style={{ width: '100%', maxWidth: 560, marginBottom: 16 }}>
        <Select
          showSearch
          allowClear
          filterOption={false}
          placeholder="Выберите мотоклуб"
          style={{ width: '100%' }}
          loading={motoclubsLoading}
          options={options}
          value={selectedMotoclubId}
          onSearch={setSearch}
          onChange={(value) => setSelectedMotoclubId(value ?? null)}
          notFoundContent={motoclubsLoading ? 'Загрузка...' : 'Ничего не найдено'}
        />
        <Button
          type="primary"
          loading={isJoining}
          disabled={!selectedMotoclubId || isJoining}
          onClick={() => void onJoin()}
        >
          Вступить
        </Button>
      </Space.Compact>

      {joinedLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : joinedList.length === 0 ? (
        <Typography.Text type="secondary">Вы пока не состоите в мотоклубах</Typography.Text>
      ) : (
        <div className="joined-motoclubs-grid">
          {joinedList.map((motoclub) => {
            const logoSrc = motoclub.logo ? `${API_URL}${motoclub.logo}` : null

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

                <Tooltip title="Удалить мотоклуб">
                  <button
                    type="button"
                    className="joined-motoclub-tile__remove"
                    aria-label="Удалить мотоклуб"
                    disabled={leavingId === motoclub.id}
                    onClick={(event) => void onLeave(event, motoclub.id)}
                  >
                    <CloseOutlined />
                  </button>
                </Tooltip>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default UserJoinedMotoclubs

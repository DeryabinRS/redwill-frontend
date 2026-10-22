import { App as AntdApp, Button, Flex, Select, Space } from 'antd'
import { useMemo, useState } from 'react'
import {
  useGetJoinedMotoclubsQuery,
  useGetMotoclubListQuery,
  useJoinMotoclubMutation,
} from '@features/motoclub/motoclubSlice'

const MAX_JOINED_MOTOCLUBS = 2

type UserJoinedMotoclubsProps = {
  onJoined?: () => void
}

/** Форма вступления в мотоклуб. */
function UserJoinedMotoclubs({ onJoined }: UserJoinedMotoclubsProps) {
  const { message } = AntdApp.useApp()
  const [selectedMotoclubId, setSelectedMotoclubId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const { data: joinedData } = useGetJoinedMotoclubsQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: motoclubsData, isFetching: motoclubsLoading } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 50 },
    search,
  })
  const [joinMotoclub, { isLoading: isJoining }] = useJoinMotoclubMutation()

  const joinedIds = useMemo(
    () => new Set((joinedData?.data || []).map((item) => item.id)),
    [joinedData],
  )
  const joinedCount = joinedData?.data?.length ?? 0
  const canJoinMore = joinedCount < MAX_JOINED_MOTOCLUBS

  const options = (motoclubsData?.data || [])
    .filter((item) => !joinedIds.has(item.id))
    .map((item) => ({
      value: item.id,
      label: item.address ? `${item.name} (${item.address})` : item.name,
    }))

  const onJoin = async () => {
    if (!canJoinMore) {
      message.warning('Можно состоять не более чем в двух мотоклубах')
      return
    }
    if (!selectedMotoclubId) {
      message.warning('Выберите мотоклуб')
      return
    }

    try {
      await joinMotoclub(selectedMotoclubId).unwrap()
      message.success('Вы вступили в мотоклуб')
      setSelectedMotoclubId(null)
      onJoined?.()
    } catch {
      message.error('Не удалось вступить в мотоклуб')
    }
  }

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <Space.Compact style={{ width: '100%' }}>
        <Select
          showSearch
          allowClear
          filterOption={false}
          placeholder={'Выберите мотоклуб'}
          style={{ width: '100%' }}
          loading={motoclubsLoading}
          options={options}
          value={selectedMotoclubId}
          onSearch={setSearch}
          onChange={(value) => setSelectedMotoclubId(value ?? null)}
          notFoundContent={
            motoclubsLoading ? 'Загрузка...' : 'Ничего не найдено'
          }
        />
        <Button
          type="primary"
          loading={isJoining}
          disabled={!canJoinMore || !selectedMotoclubId || isJoining}
          onClick={() => void onJoin()}
        >
          {'Вступить в мотоклуб'}
        </Button>
      </Space.Compact>
    </Flex>
  )
}

export default UserJoinedMotoclubs

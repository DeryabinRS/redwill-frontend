import { App as AntdApp, Button, Select, Space } from 'antd'
import { useMemo, useState } from 'react'
import {
  useGetJoinedMotoclubsQuery,
  useGetMotoclubListQuery,
  useJoinMotoclubMutation,
} from '@features/motoclub/motoclubSlice'

/** Форма вступления в мотоклуб (список членств показывается в Profile). */
function UserJoinedMotoclubs() {
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

  return (
    <Space.Compact style={{ width: '100%', maxWidth: 560 }}>
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
  )
}

export default UserJoinedMotoclubs

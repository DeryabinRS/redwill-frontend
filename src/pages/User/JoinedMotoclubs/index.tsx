import { App as AntdApp, Button, Flex, Select, Space } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetJoinedMotoclubsQuery,
  useGetMotoclubListQuery,
  useJoinMotoclubMutation,
} from '@features/motoclub/motoclubSlice'

const MAX_JOINED_MOTOCLUBS = 3

type UserJoinedMotoclubsProps = {
  onJoined?: () => void
}

/** Форма вступления в мотоклуб. */
function UserJoinedMotoclubs({ onJoined }: UserJoinedMotoclubsProps) {
  const { t } = useTranslation()
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
      message.warning(t('profile.motoclubLimit', { count: MAX_JOINED_MOTOCLUBS }))
      return
    }
    if (!selectedMotoclubId) {
      message.warning(t('profile.motoclubSelectWarning'))
      return
    }

    try {
      await joinMotoclub(selectedMotoclubId).unwrap()
      message.success(t('profile.motoclubJoined'))
      setSelectedMotoclubId(null)
      onJoined?.()
    } catch {
      message.error(t('profile.motoclubJoinError'))
    }
  }

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <Space.Compact style={{ width: '100%' }}>
        <Select
          showSearch
          allowClear
          filterOption={false}
          placeholder={t('profile.motoclubSelectPlaceholder')}
          style={{ width: '100%' }}
          loading={motoclubsLoading}
          options={options}
          value={selectedMotoclubId}
          onSearch={setSearch}
          onChange={(value) => setSelectedMotoclubId(value ?? null)}
          notFoundContent={
            motoclubsLoading ? t('common.loading') : t('profile.motoclubSelectEmpty')
          }
        />
        <Button
          type="primary"
          loading={isJoining}
          disabled={!canJoinMore || !selectedMotoclubId || isJoining}
          onClick={() => void onJoin()}
        >
          {t('profile.motoclubJoin')}
        </Button>
      </Space.Compact>
    </Flex>
  )
}

export default UserJoinedMotoclubs

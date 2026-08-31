import { App as AntdApp, Button, Card, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { DeleteOutlined, EditOutlined, EyeFilled, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import {
  useDeleteMotoclubMutation,
  useGetUserMotoclubsQuery,
  type Motoclub,
} from '@features/motoclub/motoclubSlice'
import { moderationStatusOptions, moderationStatusTagColor } from '@utils/form'

function UserMotoclubs() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const { data: motoclubsData, isLoading: motoclubsLoading } = useGetUserMotoclubsQuery({ pagination })
  const [deleteMotoclub, { isLoading: isDeleting }] = useDeleteMotoclubMutation()

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    setPagination({
      page: tablePagination.current || 1,
      per_page: tablePagination.pageSize || 10,
    })
  }

  const handleDeleteMotoclub = async (motoclubId: number) => {
    try {
      await deleteMotoclub(motoclubId).unwrap()
      message.success('Мотоклуб удален')
    } catch {
      message.error('Не удалось удалить мотоклуб')
    }
  }

  const columns: ColumnsType<Motoclub> = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    {
      title: 'Участники',
      dataIndex: 'verified_members_count',
      key: 'verified_members_count',
      width: 110,
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Заявки',
      dataIndex: 'pending_members_count',
      key: 'pending_members_count',
      width: 100,
      render: (value?: number) => value ?? 0,
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (value: string) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Публикация',
      dataIndex: 'publication_status',
      key: 'publication_status',
      width: 120,
      render: (value: number) =>
        value === 1 ? <Tag color="green">Опубликован</Tag> : <Tag color="red">Не опубликован</Tag>,
    },
    {
      title: 'Модерация',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      width: 160,
      render: (value?: number) => {
        const option = moderationStatusOptions.find((item) => item.value === value)
        if (!option) return <Tag>—</Tag>
        return <Tag color={moderationStatusTagColor[value ?? 0] ?? 'default'}>{option.label}</Tag>
      },
    },
    {
      title: '',
      key: 'actions',
      width: 160,
      render: (_value, record) => {
        const canDelete =
          (record.pending_members_count ?? 0) === 0 && (record.verified_members_count ?? 0) <= 1
        const deleteTitle = canDelete
          ? 'Удалить мотоклуб'
          : 'Нельзя удалить мотоклуб, пока в нём есть другие участники или заявки'

        return (
          <Space size="small" wrap>
            <Button
              disabled={record.publication_status !== 1 || record.moderation_status !== 2}
              icon={<EyeFilled />}
              size="small"
              onClick={() => navigate(`/motoclubs/${record.id}`)}
            />
            <Button
              icon={<TeamOutlined />}
              size="small"
              title="Участники"
              onClick={() => navigate(`/motoclubs/${record.id}/members`)}
            />
            <Button
              disabled={record.moderation_status === 0 && record.publication_status !== 1}
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/motoclubs/${record.id}/edit`)}
            />
            <Tooltip title={deleteTitle}>
              <span>
                <Popconfirm
                  title="Удалить мотоклуб?"
                  description="Действие нельзя отменить"
                  okText="Удалить"
                  cancelText="Отмена"
                  okButtonProps={{ danger: true, loading: isDeleting }}
                  disabled={!canDelete}
                  onConfirm={() => void handleDeleteMotoclub(record.id)}
                >
                  <Button danger disabled={!canDelete} icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </span>
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  if (!motoclubsLoading && (motoclubsData?.total ?? 0) === 0) {
    return null
  }

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Мои мотоклубы
      </Typography.Title>
      <Table<Motoclub>
        size="small"
        rowKey="id"
        loading={motoclubsLoading}
        dataSource={motoclubsData?.data || []}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          current: motoclubsData?.current_page || pagination.page,
          pageSize: motoclubsData?.per_page || pagination.per_page,
          total: motoclubsData?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />
    </Card>
  )
}

export default UserMotoclubs

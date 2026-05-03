import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { EyeFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useGetUserMotoPostsQuery, type MotoPost } from '@features/motoPost/motoPostSlice'
import { moderationStatusOptions, moderationStatusTagColor } from '@utils/form'

function UserMotoPosts() {
  const navigate = useNavigate()
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const { data: motoPostsData, isLoading: motoPostsLoading } = useGetUserMotoPostsQuery({ pagination })

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    setPagination({
      page: tablePagination.current || 1,
      per_page: tablePagination.pageSize || 10,
    })
  }

  const columns: ColumnsType<MotoPost> = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
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
      width: 30,
      render: (_value, record) => (
        <Space size="small" wrap>
          <Button
            disabled={record.publication_status !== 1 || record.moderation_status !== 2}
            icon={<EyeFilled />}
            size="small"
            onClick={() => navigate(`/moto-posts/${record.id}`)}
          />
        </Space>
      ),
    },
  ]

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Мои мото-посты
      </Typography.Title>
      <Table<MotoPost>
        size="small"
        rowKey="id"
        loading={motoPostsLoading}
        dataSource={motoPostsData?.data || []}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          current: motoPostsData?.current_page || pagination.page,
          pageSize: motoPostsData?.per_page || pagination.per_page,
          total: motoPostsData?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />
    </Card>
  )
}

export default UserMotoPosts

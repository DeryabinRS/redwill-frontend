import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useGetUserPostsQuery, type Post } from '@features/post/postSlice'
import { moderationStatusOptions, moderationStatusTagColor } from '@utils/form'
import { EyeFilled } from '@ant-design/icons'

function UserPosts() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const { data: postsData, isLoading: postsLoading } = useGetUserPostsQuery({ pagination })

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    setPagination({
      page: tablePagination.current || 1,
      per_page: tablePagination.pageSize || 10,
    })
  }

  const columns: ColumnsType<Post> = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title' },
    {
      title: 'Дата',
      dataIndex: 'date_start',
      key: 'date_start',
      width: 110,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Публикация',
      dataIndex: 'publication_status',
      key: 'publication_status',
      width: 120,
      render: (v: number) =>
        v === 1 ? <Tag color="green">Опубликован</Tag> : <Tag color="red">Не опубликован</Tag>,
    },
    {
      title: 'Модерация',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      width: 160,
      render: (v?: number) => {
        const opt = moderationStatusOptions.find((o) => o.value === v)
        if (!opt) return <Tag>—</Tag>
        return <Tag color={moderationStatusTagColor[v ?? 0] ?? 'default'}>{opt.label}</Tag>
      },
    },
    {
      title: '',
      key: 'actions',
      width: 30,
      render: (_v, record) => (
        <Space size="small" wrap>
          <Button 
            disabled={record.publication_status !== 1 || record.moderation_status !== 2} 
            icon={<EyeFilled />} 
            size="small" 
            onClick={() => navigate(`/posts/${record.id}`)} 
          />
        </Space>
      ),
    },
  ]

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Мои события
      </Typography.Title>
      <Table<Post>
        size="small"
        rowKey="id"
        loading={postsLoading}
        dataSource={postsData?.data || []}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          current: postsData?.current_page || pagination.page,
          pageSize: postsData?.per_page || pagination.per_page,
          total: postsData?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />
    </Card>
  )
}

export default UserPosts

import { App as AntdApp, Button, Card, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useDeletePostMutation, useGetDashboardPostListQuery, type Post } from '@features/post/postSlice'
import { moderationStatusOptions, moderationStatusTagColor } from '@utils/form'

function Posts() {
  const { message } = AntdApp.useApp()
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const { data, isLoading } = useGetDashboardPostListQuery({ pagination })
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId).unwrap()
      message.success('Пост удален')
    } catch {
      message.error('Не удалось удалить пост')
    }
  }

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    setPagination({
      page: tablePagination.current || 1,
      per_page: tablePagination.pageSize || 10,
    })
  }

  const columns: ColumnsType<Post> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Дата',
      dataIndex: 'date_start',
      key: 'date_start',
      width: 80,
      render: (value: string) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Публикация',
      dataIndex: 'publication_status',
      key: 'publication_status',
      width: 80,
      render: (value: number) => value === 1 ? <Tag color="green">Опубликовано</Tag> : <Tag color="red">Черновик</Tag>,
    },
    {
      title: 'Модерация',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      width: 160,
      render: (value?: number) => {
        const option = moderationStatusOptions.find((o) => o.value === value)
        if (!option) return <Tag>—</Tag>
        return <Tag color={moderationStatusTagColor[value ?? 0] ?? 'default'}>{option.label}</Tag>
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_value, record) => (
        <Space>
          <Link to={`/dashboard/posts/${record.id}/edit`}>
            <Button icon={<EditOutlined />} size="small" />
          </Link>
          <Popconfirm
            title="Удалить пост?"
            description="Действие нельзя отменить"
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={() => handleDeletePost(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card size="small">
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Посты
        </Typography.Title>
        <Link to="/dashboard/posts/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Добавить событие
          </Button>
        </Link>
      </Space>

      <Table
        size="small"
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data || []}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          current: data?.current_page || pagination.page,
          pageSize: data?.per_page || pagination.per_page,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />
    </Card>
  )
}

export default Posts

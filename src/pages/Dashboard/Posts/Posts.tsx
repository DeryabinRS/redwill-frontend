import { App as AntdApp, Button, Popconfirm, Space, Table, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useDeletePostMutation, useGetDashboardPostsQuery, type Post } from '../../../features/post/postSlice'

function Posts() {
  const { message } = AntdApp.useApp()
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const { data, isLoading } = useGetDashboardPostsQuery({ pagination })
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
      width: 140,
      render: (value: string) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_value, record) => (
        <Space>
          <Link to={`/dashboard/posts/${record.id}/edit`}>
            <Button icon={<EditOutlined />} size="small">
              Изменить
            </Button>
          </Link>
          <Popconfirm
            title="Удалить пост?"
            description="Действие нельзя отменить"
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={() => handleDeletePost(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Посты
        </Typography.Title>
        <Link to="/dashboard/posts/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Добавить пост
          </Button>
        </Link>
      </Space>

      <Table
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
    </div>
  )
}

export default Posts

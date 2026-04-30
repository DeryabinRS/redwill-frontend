import { App as AntdApp, Button, Card, Image, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { useState } from 'react'
import {
  useDeleteMotobarMutation,
  useGetDashboardMotobarListQuery,
  type Motobar,
} from '@features/motobar/motobarSlice'
import { API_URL } from '@config/constants'
import { moderationStatusOptions, moderationStatusTagColor } from '@utils/form'

function DashboardMotobars() {
  const { message } = AntdApp.useApp()
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const { data, isLoading } = useGetDashboardMotobarListQuery({ pagination })
  const [deleteMotobar, { isLoading: isDeleting }] = useDeleteMotobarMutation()

  const handleDeleteMotobar = async (motobarId: number) => {
    try {
      await deleteMotobar(motobarId).unwrap()
      message.success('Мото-бар удален')
    } catch {
      message.error('Не удалось удалить мото-бар')
    }
  }

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    setPagination({
      page: tablePagination.current || 1,
      per_page: tablePagination.pageSize || 10,
    })
  }

  const columns: ColumnsType<Motobar> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Лого',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (value?: string | null) =>
        value ? (
          <Image
            src={`${API_URL}${value}`}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (value?: string | null) => value || <Typography.Text type="secondary">—</Typography.Text>,
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
      width: 130,
      render: (value: number) =>
        value === 1 ? <Tag color="green">Опубликован</Tag> : <Tag color="red">Не опубликован</Tag>,
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
          <Link to={`/dashboard/motobars/${record.id}/edit`}>
            <Button icon={<EditOutlined />} size="small" />
          </Link>
          <Popconfirm
            title="Удалить мото-бар?"
            description="Действие нельзя отменить"
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={() => handleDeleteMotobar(record.id)}
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
          Мотобары
        </Typography.Title>
        <Link to="/dashboard/motobars/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Добавить мото-бар
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

export default DashboardMotobars

import {
  App as AntdApp,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useState } from 'react'
import {
  useDeleteDashboardNotificationMutation,
  useGetDashboardNotificationsQuery,
  useSendDashboardMessageMutation,
  useUpdateDashboardNotificationMutation,
  type UserNotification,
} from '@features/notification/notificationSlice'
import { useGetAllUsersQuery } from '@features/user/userSlice'
import { DELETE_CONFIRM_DESCRIPTION } from '@utils/form'
import { ListBlock, ResponsiveList } from '@components/ResponsiveList/ResponsiveList'

type EditFormValues = {
  title: string
  body?: string
  type: string
  read_status: 'read' | 'unread'
}

type CreateFormValues = {
  recipient_id: number
  body: string
  send_email?: boolean
}

const typeOptions = [
  { value: 'content_status', label: 'Статус контента' },
  { value: 'motoclub_join_request', label: 'Заявка в мотоклуб' },
  { value: 'admin_message', label: 'Сообщение администрации' },
]

function DashboardMessages() {
  const { message } = AntdApp.useApp()
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })
  const [editing, setEditing] = useState<UserNotification | null>(null)
  const [form] = Form.useForm<EditFormValues>()

  const [createOpen, setCreateOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [createForm] = Form.useForm<CreateFormValues>()

  const { data, isLoading } = useGetDashboardNotificationsQuery({ pagination })
  const [updateNotification, { isLoading: isUpdating }] = useUpdateDashboardNotificationMutation()
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteDashboardNotificationMutation()
  const [sendMessage, { isLoading: isCreating }] = useSendDashboardMessageMutation()

  const { data: usersData, isFetching: usersLoading } = useGetAllUsersQuery(
    { search: userSearch, per_page: 20 },
    { skip: !createOpen },
  )

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    setPagination({
      page: tablePagination.current || 1,
      per_page: tablePagination.pageSize || 10,
    })
  }

  const openEdit = (record: UserNotification) => {
    setEditing(record)
    form.setFieldsValue({
      title: record.title,
      body: record.body || '',
      type: record.type,
      read_status: record.read_at ? 'read' : 'unread',
    })
  }

  const closeEdit = () => {
    setEditing(null)
    form.resetFields()
  }

  const onSave = async (values: EditFormValues) => {
    if (!editing) return
    try {
      await updateNotification({
        id: editing.id,
        title: values.title.trim(),
        body: values.body?.trim() || null,
        type: values.type,
        mark_unread: values.read_status === 'unread',
        read_at: values.read_status === 'read' ? (editing.read_at || new Date().toISOString()) : null,
      }).unwrap()
      message.success('Сообщение обновлено')
      closeEdit()
    } catch {
      message.error('Не удалось обновить сообщение')
    }
  }

  const onDelete = async (id: number) => {
    try {
      await deleteNotification(id).unwrap()
      message.success('Сообщение удалено')
    } catch {
      message.error('Не удалось удалить сообщение')
    }
  }

  const openCreate = () => {
    createForm.resetFields()
    setUserSearch('')
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    createForm.resetFields()
  }

  const onCreate = async (values: CreateFormValues) => {
    try {
      await sendMessage({
        recipient_id: values.recipient_id,
        body: values.body.trim(),
        send_email: !!values.send_email,
      }).unwrap()
      message.success('Сообщение отправлено')
      closeCreate()
    } catch {
      message.error('Не удалось отправить сообщение')
    }
  }

  const columns: ColumnsType<UserNotification> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Пользователь',
      key: 'user',
      width: 160,
      render: (_, record) =>
        record.user ? (
          <Space orientation="vertical" size={0}>
            <Typography.Text>{record.user.login}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.user.email}
            </Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">#{record.user_id}</Typography.Text>
        ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (value: string) => {
        const option = typeOptions.find((item) => item.value === value)
        return <Tag>{option?.label || value}</Tag>
      },
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Текст',
      dataIndex: 'body',
      key: 'body',
      ellipsis: true,
      render: (value?: string | null) => value || <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Статус',
      dataIndex: 'read_at',
      key: 'read_at',
      width: 120,
      render: (value?: string | null) =>
        value ? <Tag color="green">Прочитано</Tag> : <Tag color="gold">Новое</Tag>,
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label="Редактировать"
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Удалить сообщение?"
            description={DELETE_CONFIRM_DESCRIPTION}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={() => void onDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="Удалить" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const renderItem = (record: UserNotification) => (
    <ListBlock
      title={record.title}
      extra={<Typography.Text type="secondary">#{record.id}</Typography.Text>}
      actions={
        <>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label="Редактировать"
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Удалить сообщение?"
            description={DELETE_CONFIRM_DESCRIPTION}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={() => void onDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="Удалить" />
          </Popconfirm>
        </>
      }
    >
      <div>
        {record.user ? (
          <Space orientation="vertical" size={0}>
            <Typography.Text>{record.user.login}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.user.email}
            </Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">#{record.user_id}</Typography.Text>
        )}
      </div>
      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Tag>{typeOptions.find((item) => item.value === record.type)?.label || record.type}</Tag>
        {record.read_at ? <Tag color="green">Прочитано</Tag> : <Tag color="gold">Новое</Tag>}
      </div>
      {record.body ? <div style={{ marginTop: 4 }}>{record.body}</div> : null}
      <div style={{ marginTop: 4 }}>{dayjs(record.created_at).format('DD.MM.YYYY HH:mm')}</div>
    </ListBlock>
  )

  return (
    <Card size="small">
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Сообщения
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Создать сообщение
        </Button>
      </Space>

      <ResponsiveList
        data={data?.data || []}
        loading={isLoading}
        columns={columns}
        onChange={handleTableChange}
        pagination={{
          current: data?.current_page,
          pageSize: data?.per_page,
          total: data?.total,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
        renderItem={renderItem}
      />

      <Modal
        title="Редактировать сообщение"
        open={!!editing}
        onCancel={closeEdit}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={(values) => void onSave(values)}>
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Укажите заголовок' }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="body" label="Текст">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Тип"
            rules={[{ required: true, message: 'Выберите тип' }]}
          >
            <Select
              options={[
                ...typeOptions,
                ...(editing && !typeOptions.some((item) => item.value === editing.type)
                  ? [{ value: editing.type, label: editing.type }]
                  : []),
              ]}
            />
          </Form.Item>
          <Form.Item name="read_status" label="Статус прочтения" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'unread', label: 'Новое' },
                { value: 'read', label: 'Прочитано' },
              ]}
            />
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={closeEdit}>Отмена</Button>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Сохранить
            </Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="Создать сообщение"
        open={createOpen}
        onCancel={closeCreate}
        footer={null}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" onFinish={(values) => void onCreate(values)}>
          <Form.Item
            name="recipient_id"
            label="Пользователь"
            rules={[{ required: true, message: 'Выберите пользователя' }]}
          >
            <Select
              showSearch
              filterOption={false}
              onSearch={(value) => setUserSearch(value)}
              placeholder="Поиск по логину, email или имени"
              loading={usersLoading}
              notFoundContent={usersLoading ? 'Загрузка...' : 'Ничего не найдено'}
              options={(usersData?.data ?? []).map((user) => ({
                value: user.id,
                label: `${user.login} (${user.email})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="body"
            label="Текст сообщения"
            rules={[{ required: true, message: 'Введите текст сообщения' }]}
          >
            <Input.TextArea rows={4} maxLength={2000} showCount />
          </Form.Item>
          <Form.Item name="send_email" valuePropName="checked" initialValue={false}>
            <Checkbox>Отправить на email</Checkbox>
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={closeCreate}>Отмена</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Отправить
            </Button>
          </Space>
        </Form>
      </Modal>
    </Card>
  )
}

export default DashboardMessages

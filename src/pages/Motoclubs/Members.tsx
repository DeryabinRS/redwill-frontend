import { App as AntdApp, Avatar, Button, Card, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { API_URL } from '@config/constants'
import { useGetUserInfoQuery } from '@features/user/userSlice'
import {
  useGetMotoclubMembersQuery,
  useRemoveMotoclubMemberMutation,
  useUpdateMotoclubMemberMutation,
  type MotoclubManagedMember,
} from '@features/motoclub/motoclubSlice'

function MotoclubMembers() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { motoclub } = useParams<{ motoclub: string }>()
  const isDashboard = pathname.startsWith('/dashboard')
  const backPath = isDashboard ? '/dashboard/motoclubs' : '/profile'
  const backLabel = isDashboard ? 'К списку мотоклубов' : 'К профилю'
  const { data: userInfo } = useGetUserInfoQuery()
  const { data, isLoading, isError, error } = useGetMotoclubMembersQuery(motoclub as string, {
    skip: !motoclub,
  })
  const [updateMember, { isLoading: isUpdating }] = useUpdateMotoclubMemberMutation()
  const [removeMember, { isLoading: isRemoving }] = useRemoveMotoclubMemberMutation()

  const isForbidden = Boolean(error && 'status' in error && error.status === 403)
  const isCreator = Boolean(userInfo && data?.motoclub.user_id === userInfo.id)

  const canToggleAdmin = (record: MotoclubManagedMember) => {
    if (!record.verified || isUpdating || !userInfo) return false
    // Создатель и сам пользователь не могут менять свою админку
    if (record.is_owner || record.id === userInfo.id) return false
    // Снять админку может только создатель; назначить — любой управляющий (доступ на страницу уже есть)
    if (record.is_admin === 1) return isCreator
    return true
  }

  const handleAccept = async (userId: number) => {
    if (!motoclub) return

    try {
      await updateMember({ motoclub, userId, status: 'member' }).unwrap()
      message.success('Заявка принята')
    } catch {
      message.error('Не удалось принять заявку')
    }
  }

  const handleAdminChange = async (userId: number, isAdmin: boolean) => {
    if (!motoclub) return

    try {
      await updateMember({ motoclub, userId, is_admin: isAdmin ? 1 : 0 }).unwrap()
      message.success(isAdmin ? 'Назначен администратором' : 'Права администратора сняты')
    } catch {
      message.error('Не удалось изменить права администратора')
    }
  }

  const handleRemove = async (userId: number) => {
    if (!motoclub) return

    try {
      await removeMember({ motoclub, userId }).unwrap()
      message.success('Участник удалён из клуба')
    } catch {
      message.error('Не удалось удалить участника')
    }
  }

  const columns: ColumnsType<MotoclubManagedMember> = [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 64,
      render: (value: string | null, record) =>
        value ? (
          <Avatar src={`${API_URL}${value}`} alt={record.login} />
        ) : (
          <Avatar icon={<UserOutlined />} />
        ),
    },
    {
      title: 'Логин',
      dataIndex: 'login',
      key: 'login',
      render: (value: string, record) => (
        <Space>
          <span>{value}</span>
          {record.is_owner ? <Tag color="blue">Создатель</Tag> : null}
          {!record.is_owner && record.is_admin === 1 ? <Tag color="blue">Администратор</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Дата',
      dataIndex: 'joined_at',
      key: 'joined_at',
      width: 120,
      render: (value: string) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Статус',
      key: 'status',
      width: 180,
      render: (_value, record) =>
        record.verified ? (
          <Tag color="green">Участник</Tag>
        ) : (
          <Button size="small" type="primary" loading={isUpdating} onClick={() => void handleAccept(record.id)}>
            Принять заявку
          </Button>
        ),
    },
    {
      title: 'Админ',
      key: 'is_admin',
      width: 100,
      render: (_value, record) => (
        <Switch
          checked={record.is_admin === 1}
          disabled={!canToggleAdmin(record)}
          checkedChildren="да"
          unCheckedChildren="нет"
          onChange={(checked) => void handleAdminChange(record.id, checked)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_value, record) => (
        <Popconfirm
          title="Удалить из клуба?"
          description="Пользователь будет исключён из мотоклуба"
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true, loading: isRemoving }}
          disabled={record.is_owner}
          onConfirm={() => void handleRemove(record.id)}
        >
          <Button danger disabled={record.is_owner} icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ]

  if (isForbidden) {
    return (
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Участники сообщества
        </Typography.Title>
        <Typography.Paragraph type="danger">
          Доступ только для создателя мотоклуба и администратора.
        </Typography.Paragraph>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(backPath)}>
          {backLabel}
        </Button>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Участники сообщества
        </Typography.Title>
        <Typography.Paragraph type="danger">Не удалось загрузить участников.</Typography.Paragraph>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(backPath)}>
          {backLabel}
        </Button>
      </Card>
    )
  }

  const content = (
    <Card>
      <Space style={{ marginBottom: 16 }} wrap>
        <Link to={backPath}>
          <Button icon={<ArrowLeftOutlined />}>{backLabel}</Button>
        </Link>
      </Space>

      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Участники сообщества
      </Typography.Title>
      {data?.motoclub.name ? (
        <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
          {data.motoclub.name}
        </Typography.Paragraph>
      ) : null}

      <Table<MotoclubManagedMember>
        size="small"
        rowKey="id"
        loading={isLoading}
        dataSource={data?.members || []}
        columns={columns}
        pagination={false}
        scroll={{ x: 800 }}
      />
    </Card>
  )

  if (isDashboard) {
    return content
  }

  return (
    <div className="container" style={{ marginTop: 8 }}>
      {content}
    </div>
  )
}

export default MotoclubMembers

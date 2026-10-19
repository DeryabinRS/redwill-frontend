import { App as AntdApp, Card, Space, Switch, Tag, Typography } from 'antd'

import {
  useGetAllUsersQuery,
  useGetUserInfoQuery,
  useUpdateUserBanedMutation,
  type UserInfo,
} from '../../../features/user/userSlice'
import { ListBlock, ResponsiveList } from '../../../components/ResponsiveList/ResponsiveList'

function Users() {
  const { message } = AntdApp.useApp()
  const { data: usersData, isLoading } = useGetAllUsersQuery()
  const { data: currentUser } = useGetUserInfoQuery()
  const [updateUserBaned, { isLoading: isUpdatingBaned }] = useUpdateUserBanedMutation()

  const handleBanedChange = async (user: UserInfo, checked: boolean) => {
    try {
      await updateUserBaned({ id: user.id, baned: checked ? 1 : 0 }).unwrap()
      message.success(checked ? 'Пользователь заблокирован' : 'Пользователь разблокирован')
    } catch {
      message.error('Не удалось изменить статус блокировки')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Login',
      dataIndex: 'login',
      key: 'login',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Роли',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space>
          {roles.map(role => (
            <Tag 
              key={role} 
              color={role === 'admin' ? 'blue' : role === 'editor' ? 'green' : 'default'}
            >
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'baned',
      key: 'baned',
      width: 130,
      render: (baned: number) => (
        baned === 1 ? <Tag color="red">Заблокирован</Tag> : <Tag color="green">Активен</Tag>
      ),
    },
    {
      title: 'Блокировка',
      key: 'actions',
      width: 150,
      render: (_: undefined, record: UserInfo) => (
        <Switch
          checked={record.baned === 1}
          checkedChildren="baned"
          unCheckedChildren="active"
          disabled={record.id === currentUser?.id || isUpdatingBaned}
          loading={isUpdatingBaned}
          onChange={(checked) => handleBanedChange(record, checked)}
        />
      ),
    },
  ]

  const renderItem = (user: UserInfo) => (
    <ListBlock
      title={user.login}
      extra={<Typography.Text type="secondary">#{user.id}</Typography.Text>}
      actions={
        <Switch
          checked={user.baned === 1}
          checkedChildren="baned"
          unCheckedChildren="active"
          disabled={user.id === currentUser?.id || isUpdatingBaned}
          loading={isUpdatingBaned}
          onChange={(checked) => handleBanedChange(user, checked)}
        />
      }
    >
      <div>{user.email}</div>
      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {user.roles.map((role) => (
          <Tag key={role} color={role === 'admin' ? 'blue' : role === 'editor' ? 'green' : 'default'}>
            {role}
          </Tag>
        ))}
      </div>
      <div style={{ marginTop: 4 }}>
        {user.baned === 1 ? <Tag color="red">Заблокирован</Tag> : <Tag color="green">Активен</Tag>}
      </div>
    </ListBlock>
  )

  return (
    <Card size="small">
      <Typography.Title level={4}>Пользователи</Typography.Title>
      
      <ResponsiveList
        data={usersData?.data || []}
        loading={isLoading}
        columns={columns}
        pagination={{
          current: usersData?.current_page,
          pageSize: usersData?.per_page,
          total: usersData?.total,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
        renderItem={renderItem}
      />
    </Card>
  )
}

export default Users

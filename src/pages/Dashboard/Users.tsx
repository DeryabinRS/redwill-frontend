import { Table, Typography, Tag, Space } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useGetAllUsersQuery, type UserInfo } from '../../features/user/userSlice'

function Users() {
  const { data: usersData, isLoading } = useGetAllUsersQuery()

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Ф.И.О.',
      dataIndex: 'name',
      key: 'name',
      render: (_: undefined, record: UserInfo) => (
        <Space>
          <UserOutlined />
          <Link to={`/dashboard/users/${record.id}`}>
            {`${record.last_name} ${record.first_name} ${record?.middle_name || ''}`}
          </Link>
        </Space>
      ),
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
  ]

  return (
    <div>
      <Typography.Title level={2}>Пользователи</Typography.Title>
      
      <Table
        dataSource={usersData?.data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: usersData?.current_page,
          pageSize: usersData?.per_page,
          total: usersData?.total,
          showSizeChanger: true,
          showTotal: (total) => `Всего: ${total}`,
        }}
      />
    </div>
  )
}

export default Users

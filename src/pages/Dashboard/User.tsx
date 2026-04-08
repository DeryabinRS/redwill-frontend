import { useParams, Link } from 'react-router-dom'
import { Card, Typography, Tag, Space, Descriptions, Button } from 'antd'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import { useGetUserQuery } from '../../features/user/userSlice'

function User() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const { data: user, isLoading } = useGetUserQuery(userId)
  
  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!user) {
    return <div>Пользователь не найден</div>
  }

  return (
    <div>
      <Link to="/dashboard/users">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          К списку пользователей
        </Button>
      </Link>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="center">
            <UserOutlined style={{ fontSize: 48 }} />
            <Typography.Title level={2} style={{ margin: 0 }}>
              {user.first_name} {user.last_name}
            </Typography.Title>
          </Space>

          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Имя">{user.first_name}</Descriptions.Item>
            <Descriptions.Item label="Фамилия">{user.last_name}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label="Роли">
              <Space>
                {user.roles.map(role => (
                  <Tag 
                    key={role} 
                    color={role === 'admin' ? 'blue' : role === 'editor' ? 'green' : 'default'}
                  >
                    {role}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </div>
  )
}

export default User

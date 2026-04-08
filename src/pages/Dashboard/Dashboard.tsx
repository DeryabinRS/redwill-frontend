import { Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { UserOutlined, ShoppingOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons'
import { useGetUserInfoQuery } from '../../features/user/userSlice'

function Dashboard() {
  const { data: userInfo } = useGetUserInfoQuery()

  return (
    <div>
      <Typography.Title level={2}>Панель администратора</Typography.Title>
      <Typography.Paragraph>
        Добро пожаловать, {userInfo?.first_name} {userInfo?.last_name}!
      </Typography.Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Пользователи"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Заказы"
              value={93}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Доход"
              value={289000}
              prefix={<DollarOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Рост"
              value={12.5}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Последние действия">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>Новый пользователь зарегистрирован</Typography.Text>
              <Typography.Text>Заказ #1234 выполнен</Typography.Text>
              <Typography.Text>Обновлены настройки системы</Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Система">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>Версия системы: 1.0.0</Typography.Text>
              <Typography.Text>Статус: Онлайн</Typography.Text>
              <Typography.Text>Ваша роль: {userInfo?.roles.join(', ')}</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

import { Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { CoffeeOutlined, ScheduleOutlined, ShopOutlined, TeamOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useGetDashboardMotobarListQuery } from '@features/motobar/motobarSlice'
import { useGetDashboardMotoclubListQuery } from '@features/motoclub/motoclubSlice'
import { useGetDashboardMotoPostListQuery } from '@features/motoPost/motoPostSlice'
import { useGetDashboardPostListQuery } from '@features/post/postSlice'
import { useGetDashboardServiceStationListQuery } from '@features/serviceStation/serviceStationSlice'
import { useGetAllUsersQuery, useGetUserInfoQuery } from '../../features/user/userSlice'

const dashboardPagination = { page: 1, per_page: 1 }

function formatDate(value?: string) {
  return value ? dayjs(value).format('DD.MM.YYYY HH:mm') : 'дата неизвестна'
}

function Dashboard() {
  const { data: userInfo } = useGetUserInfoQuery()
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery()
  const { data: postsData, isLoading: isLoadingPosts } = useGetDashboardPostListQuery({
    pagination: dashboardPagination,
  })
  const { data: motoclubsData, isLoading: isLoadingMotoclubs } = useGetDashboardMotoclubListQuery({
    pagination: dashboardPagination,
  })
  const { data: motobarsData, isLoading: isLoadingMotobars } = useGetDashboardMotobarListQuery({
    pagination: dashboardPagination,
  })
  const { data: motoPostsData, isLoading: isLoadingMotoPosts } = useGetDashboardMotoPostListQuery({
    pagination: dashboardPagination,
  })
  const { data: serviceStationsData, isLoading: isLoadingServiceStations } = useGetDashboardServiceStationListQuery({
    pagination: dashboardPagination,
  })

  const stats = [
    {
      title: 'Пользователи',
      value: usersData?.total || 0,
      icon: <UserOutlined />,
      loading: isLoadingUsers,
    },
    {
      title: 'События',
      value: postsData?.total || 0,
      icon: <ScheduleOutlined />,
      loading: isLoadingPosts,
    },
    {
      title: 'Мотоклубы',
      value: motoclubsData?.total || 0,
      icon: <TeamOutlined />,
      loading: isLoadingMotoclubs,
    },
    {
      title: 'Мото-бары',
      value: motobarsData?.total || 0,
      icon: <CoffeeOutlined />,
      loading: isLoadingMotobars,
    },
    {
      title: 'Мото-посты',
      value: motoPostsData?.total || 0,
      icon: <ShopOutlined />,
      loading: isLoadingMotoPosts,
    },
    {
      title: 'СТО',
      value: serviceStationsData?.total || 0,
      icon: <ToolOutlined />,
      loading: isLoadingServiceStations,
    },
  ]

  const recentItems = [
    usersData?.data?.[0] && `Последний пользователь: ${usersData.data[0].login} (${formatDate(usersData.data[0].created_at)})`,
    postsData?.data?.[0] && `Последнее событие: ${postsData.data[0].title} (${formatDate(postsData.data[0].created_at)})`,
    motoclubsData?.data?.[0] && `Последний мотоклуб: ${motoclubsData.data[0].name} (${formatDate(motoclubsData.data[0].created_at)})`,
    motobarsData?.data?.[0] && `Последний мото-бар: ${motobarsData.data[0].name} (${formatDate(motobarsData.data[0].created_at)})`,
    motoPostsData?.data?.[0] && `Последний мото-пост: ${motoPostsData.data[0].name} (${formatDate(motoPostsData.data[0].created_at)})`,
    serviceStationsData?.data?.[0] && `Последняя СТО: ${serviceStationsData.data[0].name} (${formatDate(serviceStationsData.data[0].created_at)})`,
  ].filter(Boolean)

  return (
    <div>
      <Typography.Paragraph>
        Добро пожаловать, {userInfo?.first_name || userInfo?.login}!
      </Typography.Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        {stats.map((stat) => (
          <Col key={stat.title} xs={24} sm={12} lg={8}>
            <Card loading={stat.loading}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Последние действия">
            <Space direction="vertical" style={{ width: '100%' }}>
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <Typography.Text key={item}>
                    {item}
                  </Typography.Text>
                ))
              ) : (
                <Typography.Text type="secondary">Данных пока нет</Typography.Text>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Система">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>Всего сущностей: {stats.reduce((sum, stat) => sum + Number(stat.value || 0), 0)}</Typography.Text>
              <Typography.Text>Статус: Онлайн</Typography.Text>
              <Typography.Text>Ваша роль: {userInfo?.roles.join(', ') || 'не указана'}</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Col, Row, Skeleton, Space, Typography } from 'antd'
import { CoffeeOutlined, PlusOutlined, ScheduleOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'
// import { useTranslation } from 'react-i18next'
import MapHeaderCanvas from '../components/MapHeaderCanvas/MapHeaderCanvas'
import PostFeed from '../components/PostFeed'
import ThemeButton from '@components/UI/Buttons/ThemeButton'
import { API_URL } from '@config/constants'
import { useGetMotoclubListQuery, type Motoclub } from '@features/motoclub/motoclubSlice'
import { useGetMotobarListQuery, type Motobar } from '@features/motobar/motobarSlice'
import { useGetMotoPostListQuery, type MotoPost } from '@features/motoPost/motoPostSlice'
import { useGetServiceStationListQuery, type ServiceStation } from '@features/serviceStation/serviceStationSlice'

const RESOURCE_PREVIEW_LIMIT = 12

type HomeResourceItem = Motoclub | Motobar | MotoPost | ServiceStation

function getRandomResourceItems<T extends HomeResourceItem>(items: T[]) {
  return [...items]
    .filter((item) => item.logo)
    .sort(() => Math.random() - 0.5)
    .slice(0, RESOURCE_PREVIEW_LIMIT)
}

function Home() {
  // const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: motoclubsData, isLoading: isLoadingMotoclubs } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: motobarsData, isLoading: isLoadingMotobars } = useGetMotobarListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: motoPostsData, isLoading: isLoadingMotoPosts } = useGetMotoPostListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: serviceStationsData, isLoading: isLoadingServiceStations } = useGetServiceStationListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const cardData = [
    {title: 'Календарь', desc: '', icon: <ScheduleOutlined style={{ fontSize: 28 }} />, link: '/calendar' },
    {title: 'Мотоклубы', desc: '', icon: <TeamOutlined style={{ fontSize: 28 }} />, link: '/motoclubs' },
    {title: 'Мото-бары', desc: '', icon: <CoffeeOutlined style={{ fontSize: 28 }} />, link: '/motobars' },
    {title: 'Мото-посты', desc: '', icon: <ShopOutlined style={{ fontSize: 28 }} />, link: '/moto-posts' },
    {title: 'СТО', desc: '', icon: <ToolOutlined style={{ fontSize: 28 }} />, link: '/service-stations' },
  ];

  const renderCard = () => cardData.map((item, index) => (
    <Col key={item.title} xs={12} lg={6} xl={4}>
      <Link to={item.link}>
        <div className="card-stripes" style={{ height: '100%' }}>
            <div className="stripe-bg"></div>
            <div className="stripe-border"></div>
            <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
            <div className="content">
              <div className="card-switch-icon">{item.icon}</div>
              <div>
                <Typography.Title level={5} className="card-switch-title">
                  {item.title}
                </Typography.Title>
                <Typography.Paragraph className="card-switch-description">
                  {item.desc}
                </Typography.Paragraph>
              </div>
            </div>
        </div>
      </Link>
    </Col>
  ));

  const randomMotoclubs = useMemo(() => getRandomResourceItems(motoclubsData?.data || []), [motoclubsData?.data])
  const randomMotobars = useMemo(() => getRandomResourceItems(motobarsData?.data || []), [motobarsData?.data])
  const randomMotoPosts = useMemo(() => getRandomResourceItems(motoPostsData?.data || []), [motoPostsData?.data])
  const randomServiceStations = useMemo(
    () => getRandomResourceItems(serviceStationsData?.data || []),
    [serviceStationsData?.data],
  )

  const resourceBlocks = [
    {
      title: 'Мотоклубы',
      description: 'Клубы и объединения райдеров.',
      link: '/motoclubs',
      createLink: '/motoclubs/create',
      icon: <TeamOutlined />,
      items: randomMotoclubs,
      isLoading: isLoadingMotoclubs,
    },
    {
      title: 'Мото-бары',
      description: 'Места встреч и отдыха мотосообщества.',
      link: '/motobars',
      createLink: '/motobars/create',
      icon: <CoffeeOutlined />,
      items: randomMotobars,
      isLoading: isLoadingMotobars,
    },
    {
      title: 'Мото-посты',
      description: 'Полезные точки на маршрутах и в городе.',
      link: '/moto-posts',
      createLink: '/moto-posts/create',
      icon: <ShopOutlined />,
      items: randomMotoPosts,
      isLoading: isLoadingMotoPosts,
    },
    {
      title: 'СТО',
      description: 'Сервисы и мастерские для мотоциклов.',
      link: '/service-stations',
      createLink: '/service-stations/create',
      icon: <ToolOutlined />,
      items: randomServiceStations,
      isLoading: isLoadingServiceStations,
    },
  ]

  const renderResourceBlock = (block: typeof resourceBlocks[number]) => (
    <Col key={block.title} xs={24} xl={12}>
      <div className="home-resource-card">
        <div className="home-resource-card__header">
          <div>
            <Typography.Text className="home-resource-card__eyebrow">
              раздел
            </Typography.Text>
            <Typography.Title level={3} className="home-resource-card__title">
              {block.title}
            </Typography.Title>
            <Typography.Paragraph className="home-resource-card__description">
              {block.description}
            </Typography.Paragraph>
          </div>
          <div className="home-resource-card__icon">
            {block.icon}
          </div>
        </div>

        <div className="home-resource-card__actions">
          <ThemeButton onClick={() => navigate(block.link)}>
            Смотреть все
          </ThemeButton>
          <ThemeButton icon={<PlusOutlined />} onClick={() => navigate(block.createLink)}>
            Добавить
          </ThemeButton>
        </div>

        {block.isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <div className="home-resource-gallery">
            {block.items.map((item) => (
              <Link
                key={`${block.link}-${item.id}`}
                to={`${block.link}/${item.id}`}
                className="home-resource-gallery__item"
                title={item.name}
              >
                <img src={`${API_URL}${item.logo}`} alt={item.name} loading="lazy" />
                <span>{item.name}</span>
              </Link>
            ))}
            {block.items.length === 0 && (
              <Typography.Text className="home-resource-card__empty">
                Пока нет опубликованных элементов с изображениями.
              </Typography.Text>
            )}
          </div>
        )}
      </div>
    </Col>
  )

  return (
    <>
      <section className="section section__header" style={{ padding: '16px 0' }}>
        <MapHeaderCanvas />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="route-tile-panel">
            <Row gutter={[12, 12]}>
              {renderCard()}
            </Row>
          </div>
        </div>
      </section>

      <section className="section section__events" style={{ padding: '30px 0' }}>
        <div className="container">
          <div className="events_header" style={{ marginTop: -80, zIndex: 1 }}>
            <Typography.Title level={2} className="events_title">
              Ближайшие события
            </Typography.Title>
          </div>
          <Space.Compact>
            <ThemeButton icon={<ScheduleOutlined />} onClick={() => navigate('/calendar')}>
              Календарь
            </ThemeButton>
            <ThemeButton icon={<PlusOutlined />} onClick={() => navigate('/posts/create')}>
              Добавить событие
            </ThemeButton>
          </Space.Compact>
          <PostFeed />
        </div>
      </section>

      <section className="section home-resources-section" style={{ padding: '30px 0' }}>
        <div className="container">
          <Row gutter={[16, 16]}>
            {resourceBlocks.map(renderResourceBlock)}
          </Row>
        </div>
      </section>

    </>
  )
}

export default Home



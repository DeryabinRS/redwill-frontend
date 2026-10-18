import { Alert, Card, Col, Divider, Row, Skeleton, Space, Tooltip, Typography } from 'antd'
import { CalendarOutlined, CoffeeOutlined, EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, ShopOutlined, ToolOutlined } from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotoclubQuery } from '@features/motoclub/motoclubSlice'
import MapView from '@components/YandexMapV3/MapView'
import PostFeed from '@components/PostFeed/PostFeed'
import '@components/PostFeed/PostFeed.css'
import StarRating from '@components/StarRating'
import Seo from '@components/Seo'
import { isAuthenticated } from '@utils/auth'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

type MotoclubLinkItem = {
  id: number
  slug: string
  name: string
  logo?: string | null
}

function MotoclubLogoLink({ item }: { item: MotoclubLinkItem }) {
  return (
    <Link
      to={`/motoclubs/${item.slug}`}
      title={item.name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'inherit',
      }}
    >
      {item.logo ? (
        <img
          src={`${API_URL}${item.logo}`}
          alt={item.name}
          style={{ width: 80 }}
        />
      ) : (
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontWeight: 600,
          }}
        >
          {item.name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </Link>
  )
}

function Motoclub() {
  const { motoclub } = useParams<{ motoclub: string }>()
  const navigate = useNavigate()
  const shouldSkipQuery = !motoclub

  const {
    data: motoclubData,
    isLoading,
    isError,
  } = useGetMotoclubQuery(motoclub as string, {
    skip: shouldSkipQuery,
  })

  if (shouldSkipQuery) {
    return (
      <div className="container">
        <Alert type="error" showIcon message="Некорректный идентификатор мотоклуба" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (isError || !motoclubData) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Alert type="error" showIcon message="Не удалось загрузить мотоклуб" />
      </div>
    )
  }

  const logoSrc = motoclubData.logo ? `${API_URL}${motoclubData.logo}` : null
  const parent = motoclubData.parent
  const children = motoclubData.children ?? []
  // Показываем только подтверждённых участников (verified не NULL)
  const verifiedMembers = (motoclubData.members ?? []).filter((member) => member.verified !== null)
  const isAuthenticatedUser = isAuthenticated()

  const plainDesc = (motoclubData.desc || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = (plainDesc || motoclubData.name).slice(0, 160)
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: motoclubData.name,
    description: plainDesc || undefined,
    logo: logoSrc || undefined,
    url: motoclubData.website || undefined,
    telephone: motoclubData.phone || undefined,
    address: motoclubData.address
      ? { '@type': 'PostalAddress', streetAddress: motoclubData.address }
      : undefined,
  }

  return (
    <div className="container">
      <Seo
        title={motoclubData.name}
        description={description}
        path={`/motoclubs/${motoclubData.slug}`}
        image={logoSrc || undefined}
        type="website"
        jsonLd={orgJsonLd}
      />
      <Card style={{ marginTop: 8 }}>
        <Row gutter={[24, 24]}>
          {logoSrc && (
            <Col xs={24} md={8}>
              <img
                src={logoSrc}
                alt={motoclubData.name}
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              />
            </Col>
          )}

          <Col xs={24} md={logoSrc ? 16 : 24}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <Title level={3} style={{ margin: 0 }}>
                  {motoclubData.name}
                </Title>
                <Space size="middle" align="center">
                  {motoclubData.has_moto_post ? (
                    <Tooltip title="Есть байк-пост">
                      <span className="shell__chip shell__chip--accent">
                        <ShopOutlined />
                      </span>
                    </Tooltip>
                  ) : null}
                  {motoclubData.has_service_station ? (
                    <Tooltip title="Есть СТО">
                      <span className="shell__chip shell__chip--accent">
                        <ToolOutlined />
                      </span>
                    </Tooltip>
                  ) : null}
                  {motoclubData.has_motobar ? (
                    <Tooltip title="Есть мото-бар">
                      <span className="shell__chip shell__chip--accent">
                        <CoffeeOutlined />
                      </span>
                    </Tooltip>
                  ) : null}
                  <StarRating
                    type="motoclub"
                    id={motoclubData.id}
                    starsCount={motoclubData.stars_count ?? 0}
                    isStarred={Boolean(motoclubData.is_starred)}
                  />
                </Space>
              </div>
              <Divider style={{ margin: 0 }} />

              <Space orientation="vertical" size={8}>
                {motoclubData.address && (
                  <Space size={8}>
                    <EnvironmentOutlined />
                    <Text type="secondary">{motoclubData.address}</Text>
                  </Space>
                )}

                {motoclubData.website && (
                  <Space size={8}>
                    <GlobalOutlined />
                    <a href={motoclubData.website} target="_blank" rel="noreferrer">
                      {motoclubData.website}
                    </a>
                  </Space>
                )}

                {motoclubData.social_link && (
                  <Space size={8}>
                    <GlobalOutlined />
                    <a href={motoclubData.social_link} target="_blank" rel="noreferrer">
                      {motoclubData.social_link}
                    </a>
                  </Space>
                )}

                {motoclubData.phone && (
                  <Space size={8}>
                    <PhoneOutlined />
                    <Text type="secondary">{motoclubData.phone}</Text>
                  </Space>
                )}

                {motoclubData.email && (
                  <Space size={8}>
                    <MailOutlined />
                    <a href={`mailto:${motoclubData.email}`}>{motoclubData.email}</a>
                  </Space>
                )}

                {motoclubData.birthday && dayjs(motoclubData.birthday).isValid() && (
                  <Space size={8}>
                    <CalendarOutlined />
                    <Text type="secondary">День рождения клуба: {dayjs(motoclubData.birthday).format('DD.MM.YYYY')}</Text>
                  </Space>
                )}

                {motoclubData.parent_id && parent && (
                  <Space orientation="vertical" size={8}>
                    <Text strong>Родительский мотоклуб:</Text>
                    <MotoclubLogoLink item={parent} />
                  </Space>
                )}

                {children.length > 0 && (
                  <Space orientation="vertical" size={8}>
                    <Text strong>Дочерние мотоклубы:</Text>
                    <Space size={12} wrap>
                      {children.map((child) => (
                        <MotoclubLogoLink key={child.id} item={child} />
                      ))}
                    </Space>
                  </Space>
                )}
              </Space>

              {motoclubData.desc && (
                <Paragraph style={{ marginBottom: 0 }}>
                  {motoclubData.desc.replace(/<[^>]*>/g, '')}
                </Paragraph>
              )}

              {motoclubData.location && <MapView location={motoclubData.location} zoom={14} />}
            </Space>
          </Col>
        </Row>
      </Card>

      {(motoclubData.moto_post || motoclubData.service_station || motoclubData.motobar) && (
        <Card style={{ marginTop: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
            Рекомендации от мотоклуба
          </Title>
          <Row gutter={[8, 8]}>
            {motoclubData.moto_post ? (
              <Col xs={24} md={24} xl={8}>
                <Card
                  size="small"
                  className="post-card post-card--compact post-card--event"
                  hoverable
                  onClick={() => navigate(`/moto-posts/${motoclubData.moto_post!.slug}`)}
                  cover={
                    motoclubData.moto_post.logo ? (
                      <div className="post-card-image-container">
                        <img
                          src={`${API_URL}${motoclubData.moto_post.logo}`}
                          alt={motoclubData.moto_post.name}
                          className="post-card-image"
                          loading="lazy"
                          style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
                        />
                      </div>
                    ) : (
                      <div className="post-card-image-placeholder">
                        <ShopOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
                      </div>
                    )
                  }
                >
                  <div className="profile-card-body">
                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                      <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
                        {motoclubData.moto_post.name}
                      </Title>
                      {motoclubData.moto_post.address ? (
                        <div className="post-card-meta">
                          <Text type="secondary" style={{ fontSize: 12 }}>{motoclubData.moto_post.address}</Text>
                        </div>
                      ) : null}
                    </Space>
                  </div>
                </Card>
              </Col>
            ) : null}
            {motoclubData.service_station ? (
              <Col xs={24} md={24} lg={12} xl={8}>
                <Card
                  size="small"
                  className="post-card post-card--compact post-card--event"
                  hoverable
                  onClick={() => navigate(`/service-stations/${motoclubData.service_station!.slug}`)}
                  cover={
                    motoclubData.service_station.logo ? (
                      <div className="post-card-image-container">
                        <img
                          src={`${API_URL}${motoclubData.service_station.logo}`}
                          alt={motoclubData.service_station.name}
                          className="post-card-image"
                          loading="lazy"
                          style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
                        />
                      </div>
                    ) : (
                      <div className="post-card-image-placeholder">
                        <ToolOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
                      </div>
                    )
                  }
                >
                  <div className="profile-card-body">
                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                      <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
                        {motoclubData.service_station.name}
                      </Title>
                      {motoclubData.service_station.address ? (
                        <div className="post-card-meta">
                          <Text type="secondary" style={{ fontSize: 12 }}>{motoclubData.service_station.address}</Text>
                        </div>
                      ) : null}
                    </Space>
                  </div>
                </Card>
              </Col>
            ) : null}
            {motoclubData.motobar ? (
              <Col xs={24} md={24} lg={12} xl={8}>
                <Card
                  size="small"
                  className="post-card post-card--compact post-card--event"
                  hoverable
                  onClick={() => navigate(`/motobars/${motoclubData.motobar!.slug}`)}
                  cover={
                    motoclubData.motobar.logo ? (
                      <div className="post-card-image-container">
                        <img
                          src={`${API_URL}${motoclubData.motobar.logo}`}
                          alt={motoclubData.motobar.name}
                          className="post-card-image"
                          loading="lazy"
                          style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
                        />
                      </div>
                    ) : (
                      <div className="post-card-image-placeholder">
                        <CoffeeOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
                      </div>
                    )
                  }
                >
                  <div className="profile-card-body">
                    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                      <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
                        {motoclubData.motobar.name}
                      </Title>
                      {motoclubData.motobar.address ? (
                        <div className="post-card-meta">
                          <Text type="secondary" style={{ fontSize: 12 }}>{motoclubData.motobar.address}</Text>
                        </div>
                      ) : null}
                    </Space>
                  </div>
                </Card>
              </Col>
            ) : null}
          </Row>
        </Card>
      )}

      <Card style={{ marginTop: 8 }}>
        <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
          Ближайшие мероприятия мотоклуба
        </Title>
        <PostFeed
          motoclubId={motoclubData.id}
          perPage={6}
          emptyText="У этого мотоклуба пока нет запланированных мероприятий"
        />
      </Card>

      <Card style={{ marginTop: 8 }}>
        <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
          Участники мотоклуба
        </Title>
        {(verifiedMembers.length ?? 0) === 0 ? (
          <Text type="secondary">Пока нет участников</Text>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {verifiedMembers.map((member) => {
              const avatarSrc = member.avatar ? `${API_URL}${member.avatar}` : null

              const memberCard = (
                <Card
                  size="small"
                  styles={{ body: { padding: '8px 10px', textAlign: 'center' } }}
                  style={{ width: 120, overflow: 'hidden' }}
                  cover={
                    avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={member.login}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(127, 127, 127, 0.15)',
                          fontWeight: 600,
                          fontSize: 22,
                        }}
                      >
                        {member.login.slice(0, 1).toUpperCase()}
                      </div>
                    )
                  }
                >
                  <Text ellipsis style={{ display: 'block', width: '100%' }}>
                    {member.login}
                  </Text>
                </Card>
              )

              if (!isAuthenticatedUser) {
                return <div key={member.id}>{memberCard}</div>
              }

              return (
                <Link
                  key={member.id}
                  to={`/users/${member.id}`}
                  title={`Профиль ${member.login}`}
                  style={{ display: 'block', color: 'inherit' }}
                >
                  {memberCard}
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Motoclub

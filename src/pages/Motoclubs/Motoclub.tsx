import { Alert, Card, Col, Divider, Row, Skeleton, Space, Tooltip, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, ShopOutlined, ToolOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotoclubQuery } from '@features/motoclub/motoclubSlice'
import MapView from '@components/YandexMapV3/MapView'
import PostFeed from '@components/PostFeed/PostFeed'
import StarRating from '@components/StarRating'
import Seo from '@components/Seo'
import { isAuthenticated } from '@utils/auth'

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

              {motoclubData.location && <MapView location={motoclubData.location} zoom={7} />}
            </Space>
          </Col>
        </Row>
      </Card>

      {(motoclubData.moto_post || motoclubData.service_station) && (
        <Card style={{ marginTop: 8 }}>
          <Row gutter={[16, 16]}>
            {motoclubData.moto_post ? (
              <Col xs={24} md={12}>
                <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>Байк-пост</Title>
                <Link
                  to={`/moto-posts/${motoclubData.moto_post.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }}
                >
                  {motoclubData.moto_post.logo ? (
                    <img
                      src={`${API_URL}${motoclubData.moto_post.logo}`}
                      alt={motoclubData.moto_post.name}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: 'rgba(127,127,127,0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShopOutlined />
                    </span>
                  )}
                  <div>
                    <Text strong style={{ display: 'block' }}>{motoclubData.moto_post.name}</Text>
                    {motoclubData.moto_post.address ? (
                      <Text type="secondary" style={{ fontSize: 12 }}>{motoclubData.moto_post.address}</Text>
                    ) : null}
                  </div>
                </Link>
              </Col>
            ) : null}
            {motoclubData.service_station ? (
              <Col xs={24} md={12}>
                <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>СТО</Title>
                <Link
                  to={`/service-stations/${motoclubData.service_station.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }}
                >
                  {motoclubData.service_station.logo ? (
                    <img
                      src={`${API_URL}${motoclubData.service_station.logo}`}
                      alt={motoclubData.service_station.name}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: 'rgba(127,127,127,0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ToolOutlined />
                    </span>
                  )}
                  <div>
                    <Text strong style={{ display: 'block' }}>{motoclubData.service_station.name}</Text>
                    {motoclubData.service_station.address ? (
                      <Text type="secondary" style={{ fontSize: 12 }}>{motoclubData.service_station.address}</Text>
                    ) : null}
                  </div>
                </Link>
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

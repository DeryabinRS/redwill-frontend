import { Alert, Card, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, PhoneOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotobarQuery } from '@features/motobar/motobarSlice'
import MapView from '@components/YandexMapV3/MapView'
import PostFeed from '@components/PostFeed/PostFeed'
import StarRating from '@components/StarRating'
import LinksList from '@components/LinksList/LinksList'
import Seo from '@components/Seo'

const { Title, Text, Paragraph } = Typography

function Motobar() {
  const { motobar } = useParams<{ motobar: string }>()
  const shouldSkipQuery = !motobar

  const {
    data: motobarData,
    isLoading,
    isError,
  } = useGetMotobarQuery(motobar as string, {
    skip: shouldSkipQuery,
  })

  if (shouldSkipQuery) {
    return (
      <div className="container">
        <Alert type="error" showIcon message="Некорректный идентификатор мото-бара" />
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

  if (isError || !motobarData) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Alert type="error" showIcon message="Не удалось загрузить мото-бар" />
      </div>
    )
  }

  const logoSrc = motobarData.logo ? `${API_URL}${motobarData.logo}` : null

  const plainDesc = (motobarData.desc || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = (plainDesc || motobarData.name).slice(0, 160)
  const barJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: motobarData.name,
    description: plainDesc || undefined,
    image: logoSrc || undefined,
    url: motobarData.website || undefined,
    telephone: motobarData.phone || undefined,
    address: motobarData.address
      ? { '@type': 'PostalAddress', streetAddress: motobarData.address }
      : undefined,
  }

  return (
    <div className="container">
      <Seo
        title={motobarData.name}
        description={description}
        path={`/motobars/${motobarData.slug}`}
        image={logoSrc || undefined}
        type="website"
        jsonLd={barJsonLd}
      />
      <Card style={{ marginTop: 8 }}>
        <Row gutter={[24, 24]}>
          {logoSrc && (
            <Col xs={24} md={8}>
              <img
                src={logoSrc}
                alt={motobarData.name}
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              />
            </Col>
          )}

          <Col xs={24} md={logoSrc ? 16 : 24}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <Title level={3} style={{ margin: 0 }}>
                  {motobarData.name}
                </Title>
                <StarRating
                  type="motobar"
                  id={motobarData.id}
                  starsCount={motobarData.stars_count ?? 0}
                  isStarred={Boolean(motobarData.is_starred)}
                />
              </div>
              <Divider style={{ margin: 0 }} />

              <Space orientation="vertical" size={8}>
                {motobarData.address && (
                  <Space size={8}>
                    <EnvironmentOutlined />
                    <Text type="secondary">{motobarData.address}</Text>
                  </Space>
                )}

                {motobarData.website && (
                  <Space size={8}>
                    <GlobalOutlined />
                    <a href={motobarData.website} target="_blank" rel="noreferrer">
                      {motobarData.website}
                    </a>
                  </Space>
                )}

                <LinksList links={motobarData.links} />

                {motobarData.phone && (
                  <Space size={8}>
                    <PhoneOutlined />
                    <Text type="secondary">{motobarData.phone}</Text>
                  </Space>
                )}
              </Space>

              {motobarData.desc && (
                <Paragraph style={{ marginBottom: 0 }}>
                  {motobarData.desc.replace(/<[^>]*>/g, '')}
                </Paragraph>
              )}

              {motobarData.location && <MapView location={motobarData.location} zoom={14} />}
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 8 }}>
        <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
          Ближайшие события мото-бара
        </Title>
        <PostFeed
          motobarId={motobarData.id}
          perPage={6}
          emptyText="У этого мото-бара пока нет запланированных событий"
        />
      </Card>
    </div>
  )
}

export default Motobar

import { Alert, Card, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, PhoneOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotoPostQuery } from '@features/motoPost/motoPostSlice'
import MapView from '@components/YandexMapV3/MapView'
import StarRating from '@components/StarRating'
import Seo from '@components/Seo'

const { Title, Text, Paragraph } = Typography

function MotoPost() {
  const { motoPost } = useParams<{ motoPost: string }>()
  const shouldSkipQuery = !motoPost

  const {
    data: motoPostData,
    isLoading,
    isError,
  } = useGetMotoPostQuery(motoPost as string, {
    skip: shouldSkipQuery,
  })

  if (shouldSkipQuery) {
    return (
      <div className="container">
        <Alert type="error" showIcon message="Некорректный идентификатор мото-поста" />
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

  if (isError || !motoPostData) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Alert type="error" showIcon message="Не удалось загрузить мото-пост" />
      </div>
    )
  }

  const logoSrc = motoPostData.logo ? `${API_URL}${motoPostData.logo}` : null

  const plainDesc = (motoPostData.desc || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const description = (plainDesc || motoPostData.name).slice(0, 160)
  const motoPostJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: motoPostData.name,
    description: plainDesc || undefined,
    image: logoSrc || undefined,
    url: motoPostData.website || undefined,
    telephone: motoPostData.phone || undefined,
    address: motoPostData.address
      ? { '@type': 'PostalAddress', streetAddress: motoPostData.address }
      : undefined,
  }

  return (
    <div className="container">
      <Seo
        title={motoPostData.name}
        description={description}
        path={`/moto-posts/${motoPostData.slug}`}
        image={logoSrc || undefined}
        type="website"
        jsonLd={motoPostJsonLd}
      />
      <Card style={{ marginTop: 8 }}>
        <Row gutter={[24, 24]}>
          {logoSrc && (
            <Col xs={24} md={8}>
              <img
                src={logoSrc}
                alt={motoPostData.name}
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              />
            </Col>
          )}

          <Col xs={24} md={logoSrc ? 16 : 24}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <Title level={3} style={{ margin: 0 }}>
                  {motoPostData.name}
                </Title>
                <StarRating
                  type="moto-post"
                  id={motoPostData.id}
                  starsCount={motoPostData.stars_count ?? 0}
                  isStarred={Boolean(motoPostData.is_starred)}
                />
              </div>
              <Divider style={{ margin: 0 }} />

              <Space orientation="vertical" size={8}>
                {motoPostData.address && (
                  <Space size={8}>
                    <EnvironmentOutlined />
                    <Text type="secondary">{motoPostData.address}</Text>
                  </Space>
                )}

                {motoPostData.website && (
                  <Space size={8}>
                    <GlobalOutlined />
                    <a href={motoPostData.website} target="_blank" rel="noreferrer">
                      {motoPostData.website}
                    </a>
                  </Space>
                )}

                {motoPostData.phone && (
                  <Space size={8}>
                    <PhoneOutlined />
                    <Text type="secondary">{motoPostData.phone}</Text>
                  </Space>
                )}
              </Space>

              {motoPostData.desc && (
                <Paragraph style={{ marginBottom: 0 }}>
                  {motoPostData.desc.replace(/<[^>]*>/g, '')}
                </Paragraph>
              )}

              {motoPostData.location && <MapView location={motoPostData.location} zoom={14} />}
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default MotoPost

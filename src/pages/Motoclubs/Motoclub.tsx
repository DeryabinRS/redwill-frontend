import { Alert, Card, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotoclubQuery } from '@features/motoclub/motoclubSlice'
import MapView from '@components/YandexMapV3/MapView'

const { Title, Text, Paragraph } = Typography

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

  return (
    <div className="container">
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
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {motoclubData.name}
              </Title>
              <Divider style={{ margin: 0 }} />

              <Space direction="vertical" size={8}>
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
    </div>
  )
}

export default Motoclub

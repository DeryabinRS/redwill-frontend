import { Alert, Card, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, PhoneOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetServiceStationQuery } from '@features/serviceStation/serviceStationSlice'
import MapView from '@components/YandexMapV3/MapView'

const { Title, Text, Paragraph } = Typography

function ServiceStation() {
  const { serviceStation } = useParams<{ serviceStation: string }>()
  const shouldSkipQuery = !serviceStation

  const {
    data: serviceStationData,
    isLoading,
    isError,
  } = useGetServiceStationQuery(serviceStation as string, {
    skip: shouldSkipQuery,
  })

  if (shouldSkipQuery) {
    return (
      <div className="container">
        <Alert type="error" showIcon message="Некорректный идентификатор СТО" />
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

  if (isError || !serviceStationData) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Alert type="error" showIcon message="Не удалось загрузить СТО" />
      </div>
    )
  }

  const logoSrc = serviceStationData.logo ? `${API_URL}${serviceStationData.logo}` : null

  return (
    <div className="container">
      <Card style={{ marginTop: 8 }}>
        <Row gutter={[24, 24]}>
          {logoSrc && (
            <Col xs={24} md={8}>
              <img
                src={logoSrc}
                alt={serviceStationData.name}
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              />
            </Col>
          )}

          <Col xs={24} md={logoSrc ? 16 : 24}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {serviceStationData.name}
              </Title>
              <Divider style={{ margin: 0 }} />

              <Space direction="vertical" size={8}>
                {serviceStationData.address && (
                  <Space size={8}>
                    <EnvironmentOutlined />
                    <Text type="secondary">{serviceStationData.address}</Text>
                  </Space>
                )}

                {serviceStationData.website && (
                  <Space size={8}>
                    <GlobalOutlined />
                    <a href={serviceStationData.website} target="_blank" rel="noreferrer">
                      {serviceStationData.website}
                    </a>
                  </Space>
                )}

                {serviceStationData.phone && (
                  <Space size={8}>
                    <PhoneOutlined />
                    <Text type="secondary">{serviceStationData.phone}</Text>
                  </Space>
                )}
              </Space>

              {serviceStationData.desc && (
                <Paragraph style={{ marginBottom: 0 }}>
                  {serviceStationData.desc.replace(/<[^>]*>/g, '')}
                </Paragraph>
              )}

              {serviceStationData.location && <MapView location={serviceStationData.location} zoom={7} />}
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default ServiceStation

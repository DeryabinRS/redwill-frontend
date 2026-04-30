import { Alert, Card, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, PhoneOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetMotobarQuery } from '@features/motobar/motobarSlice'
import MapView from '@components/YandexMapV3/MapView'

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

  return (
    <div className="container">
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
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {motobarData.name}
              </Title>
              <Divider style={{ margin: 0 }} />

              <Space direction="vertical" size={8}>
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

              {motobarData.location && <MapView location={motobarData.location} zoom={7} />}
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Motobar

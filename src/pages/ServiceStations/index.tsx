import { Card, Col, Empty, Input, Pagination, Row, Space, Spin, Typography } from 'antd'
import { EnvironmentOutlined, GlobalOutlined, ToolOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { API_URL } from '@config/constants'
import MapView, { type MapViewMarker } from '@components/YandexMapV3/MapView'
import { useGetServiceStationListQuery, type ServiceStation } from '@features/serviceStation/serviceStationSlice'
import '@components/PostFeed/PostFeed.css'

const { Title, Text, Link: TypographyLink } = Typography

const PAGE_SIZE_OPTIONS = [24, 50, 100] as const

function ServiceStationCard({ serviceStation }: { serviceStation: ServiceStation }) {
  const navigate = useNavigate()

  return (
    <Card
      size="small"
      className="post-card motoclub-list-card"
      hoverable
      onClick={() => navigate(`/service-stations/${serviceStation.id}`)}
      cover={
        serviceStation.logo ? (
          <div className="post-card-image-container" style={{ height: 160, marginTop: 8 }}>
            <img
              src={`${API_URL}${serviceStation.logo}`}
              alt={serviceStation.name}
              className="post-card-image"
              loading="lazy"
              style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder" style={{ height: 160 }}>
            <ToolOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
        <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: '16px', lineHeight: 1.2 }}>
          {serviceStation.name}
        </Title>
        <div className="post-card-meta">
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {serviceStation.address && (
              <div className="post-card-location">
                <EnvironmentOutlined className="post-card-icon" />
                <Text type="secondary" ellipsis>
                  {serviceStation.address}
                </Text>
              </div>
            )}
            {serviceStation.website && (
              <TypographyLink
                href={serviceStation.website}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                <GlobalOutlined style={{ marginRight: 6 }} />
                {serviceStation.website.replace(/^https?:\/\//i, '')}
              </TypographyLink>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

function ServiceStations() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDeferredValue(searchInput.trim())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(24)

  useEffect(() => {
    setPage(1)
  }, [search])

  const listArgs = useMemo(
    () => ({
      pagination: { page, per_page: pageSize },
      search: search || undefined,
    }),
    [page, pageSize, search],
  )

  const mapListArgs = useMemo(
    () => ({
      pagination: { page: 1, per_page: 500 },
      search: search || undefined,
    }),
    [search],
  )

  const { data, isLoading, isFetching } = useGetServiceStationListQuery(listArgs)
  const { data: mapData } = useGetServiceStationListQuery(mapListArgs)

  const serviceStations = data?.data ?? []
  const mapServiceStations = mapData?.data ?? []

  const mapMarkers: MapViewMarker[] = useMemo(
    () =>
      mapServiceStations
        .filter((serviceStation) => serviceStation.location)
        .map((serviceStation) => ({
          id: serviceStation.id,
          title: serviceStation.name,
          location: serviceStation.location,
          logo: serviceStation.logo ? `${API_URL}${serviceStation.logo}` : null,
          href: `/service-stations/${serviceStation.id}`,
        })),
    [mapServiceStations],
  )

  const total = data?.total ?? 0

  return (
    <div className="container" style={{ padding: '8px 0' }}>
      <div className="title_page">
        <div>
          <Typography.Text className="events-calendar-eyebrow">
            сервис
          </Typography.Text>
          <Typography.Title level={1} className="events-calendar-title">
            СТО
          </Typography.Title>
          <Typography.Paragraph className="events-calendar-description">
            Карта и список СТО сообщества.
          </Typography.Paragraph>
        </div>
        <ToolOutlined className="title_page__icon" />
      </div>

      <Card style={{ marginBottom: 8 }}>
        {mapMarkers.length > 0 ? (
          <MapView markers={mapMarkers} height={520} zoom={4} />
        ) : (
          <Typography.Text type="secondary">Нет СТО с координатами для отображения на карте.</Typography.Text>
        )}
      </Card>

      <Card>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Список СТО
            </Typography.Title>
            <Input.Search
              allowClear
              placeholder="Поиск по названию или адресу"
              style={{ width: 320, maxWidth: '100%' }}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </Space>

          <Spin spinning={isLoading || isFetching}>
            {serviceStations.length === 0 && !isLoading ? (
              <Empty description="Нет СТО по заданным условиям" />
            ) : (
              <Row gutter={[8, 8]}>
                {serviceStations.map((serviceStation) => (
                  <Col key={serviceStation.id} xs={12} sm={8} md={6} lg={4}>
                    <ServiceStationCard serviceStation={serviceStation} />
                  </Col>
                ))}
              </Row>
            )}
          </Spin>

          {total > 0 && (
            <Pagination
              style={{ marginTop: 8 }}
              align="end"
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={PAGE_SIZE_OPTIONS.map(String)}
              showTotal={(n) => `Всего: ${n}`}
              locale={{ items_per_page: '/ стр.' }}
              onChange={(nextPage, nextSize) => {
                setPage(nextPage)
                setPageSize(nextSize)
              }}
            />
          )}
        </Space>
      </Card>
    </div>
  )
}

export default ServiceStations

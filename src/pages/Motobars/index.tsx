import { Card, Col, Empty, Input, Pagination, Row, Space, Spin, Typography } from 'antd'
import { CoffeeOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { API_URL } from '@config/constants'
import MapView, { type MapViewMarker } from '@components/YandexMapV3/MapView'
import { useGetMotobarListQuery, type Motobar } from '@features/motobar/motobarSlice'
import '@components/PostFeed/PostFeed.css'

const { Title, Text, Link: TypographyLink } = Typography

const PAGE_SIZE_OPTIONS = [24, 50, 100] as const

function MotobarCard({ motobar }: { motobar: Motobar }) {
  const navigate = useNavigate()

  return (
    <Card
      size="small"
      className="post-card motoclub-list-card"
      hoverable
      onClick={() => navigate(`/motobars/${motobar.id}`)}
      cover={
        motobar.logo ? (
          <div className="post-card-image-container" style={{ height: 160, marginTop: 8 }}>
            <img
              src={`${API_URL}${motobar.logo}`}
              alt={motobar.name}
              className="post-card-image"
              loading="lazy"
              style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder" style={{ height: 160 }}>
            <CoffeeOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: '16px', lineHeight: 1.2 }}>
          {motobar.name}
        </Title>
        <div className="post-card-meta">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {motobar.address && (
              <div className="post-card-location">
                <EnvironmentOutlined className="post-card-icon" />
                <Text type="secondary" ellipsis>
                  {motobar.address}
                </Text>
              </div>
            )}
            {motobar.website && (
              <TypographyLink
                href={motobar.website}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                <GlobalOutlined style={{ marginRight: 6 }} />
                {motobar.website.replace(/^https?:\/\//i, '')}
              </TypographyLink>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

function Motobars() {
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

  const { data, isLoading, isFetching } = useGetMotobarListQuery(listArgs)
  const { data: mapData } = useGetMotobarListQuery(mapListArgs)

  const motobars = data?.data ?? []
  const mapMotobars = mapData?.data ?? []

  const mapMarkers: MapViewMarker[] = useMemo(
    () =>
      mapMotobars
        .filter((motobar) => motobar.location)
        .map((motobar) => ({
          id: motobar.id,
          title: motobar.name,
          location: motobar.location,
          logo: motobar.logo ? `${API_URL}${motobar.logo}` : null,
          href: `/motobars/${motobar.id}`,
        })),
    [mapMotobars],
  )

  const total = data?.total ?? 0

  return (
    <div className="container" style={{ padding: '8px 0' }}>
      <div className="title_page">
        <div>
          <Typography.Text className="events-calendar-eyebrow">
            места
          </Typography.Text>
          <Typography.Title level={1} className="events-calendar-title">
            Мото-бары
          </Typography.Title>
          <Typography.Paragraph className="events-calendar-description">
            Карта и список мото-баров сообщества.
          </Typography.Paragraph>
        </div>
        <CoffeeOutlined className="title_page__icon" />
      </div>

      <Card style={{ marginBottom: 8 }}>
        {mapMarkers.length > 0 ? (
          <MapView markers={mapMarkers} height={520} zoom={4} />
        ) : (
          <Typography.Text type="secondary">Нет мото-баров с координатами для отображения на карте.</Typography.Text>
        )}
      </Card>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Список мото-баров
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
            {motobars.length === 0 && !isLoading ? (
              <Empty description="Нет мото-баров по заданным условиям" />
            ) : (
              <Row gutter={[8, 8]}>
                {motobars.map((motobar) => (
                  <Col key={motobar.id} xs={12} sm={8} md={6} lg={4}>
                    <MotobarCard motobar={motobar} />
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

export default Motobars

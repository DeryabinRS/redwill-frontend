import { Avatar, Card, Col, Empty, Input, Modal, Pagination, Row, Space, Spin, Typography } from 'antd'
import { EnvironmentOutlined, PhoneOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { API_URL } from '@config/constants'
import MapView, { type HostUserMarker, type MapViewMarker } from '@components/YandexMapV3/MapView'
import { Shell, ShellHeader, ShellSection } from '@components/Shell'
// import LinksList from '@components/LinksList/LinksList'
import { useGetMotoPostListQuery, type MotoPost } from '@features/motoPost/motoPostSlice'
import { useGetHostUsersQuery } from '@features/user/userSlice'
import '@components/PostFeed/PostFeed.css'

const { Title, Text } = Typography

const PAGE_SIZE_OPTIONS = [24, 50, 100] as const

function MotoPostCard({ motoPost }: { motoPost: MotoPost }) {
  const navigate = useNavigate()

  return (
    <Card
      size="small"
      className="post-card motoclub-list-card"
      hoverable
      onClick={() => navigate(`/moto-posts/${motoPost.slug}`)}
      cover={
        motoPost.logo ? (
          <div className="post-card-image-container" style={{ height: 160, marginTop: 8 }}>
            <img
              src={`${API_URL}${motoPost.logo}`}
              alt={motoPost.name}
              className="post-card-image"
              loading="lazy"
              style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder" style={{ height: 160 }}>
            <ShopOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
        <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: '16px', lineHeight: 1.2 }}>
          {motoPost.name}
        </Title>
        <div className="post-card-meta">
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {motoPost.address && (
              <div className="post-card-location">
                <EnvironmentOutlined className="post-card-icon" />
                <Text type="secondary" className="post-card-location-text" title={motoPost.address}>
                  {motoPost.address}
                </Text>
              </div>
            )}
            {/* {motoPost.website && (
              <TypographyLink
                href={motoPost.website}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                <GlobalOutlined style={{ marginRight: 6 }} />
                {motoPost.website.replace(/^https?:\/\//i, '')}
              </TypographyLink>
            )}
            <LinksList
              links={motoPost.links}
              compact
              onLinkClick={(event) => event.stopPropagation()}
            /> */}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

function MotoPosts() {
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

  const { data, isLoading, isFetching } = useGetMotoPostListQuery(listArgs)
  const { data: mapData } = useGetMotoPostListQuery(mapListArgs)
  const { data: hostUsersData } = useGetHostUsersQuery()

  const [selectedHost, setSelectedHost] = useState<HostUserMarker | null>(null)

  const motoPosts = data?.data ?? []
  const mapMotoPosts = mapData?.data ?? []
  const hostUsers = hostUsersData ?? []

  const mapMarkers: MapViewMarker[] = useMemo(
    () =>
      mapMotoPosts
        .filter((motoPost) => motoPost.location)
        .map((motoPost) => ({
          id: motoPost.id,
          title: motoPost.name,
          location: motoPost.location,
          logo: motoPost.logo ? `${API_URL}${motoPost.logo}` : null,
          href: `/moto-posts/${motoPost.slug}`,
          address: motoPost.address,
        })),
    [mapMotoPosts],
  )

  const hostMarkers: HostUserMarker[] = useMemo(
    () =>
      hostUsers
        .filter((host) => host.accommodation_location)
        .map((host) => ({
          id: host.id,
          name: host.name,
          location: host.accommodation_location,
          address: host.accommodation_address,
          avatar: host.avatar ? `${API_URL}${host.avatar}` : null,
          phone: host.phone,
        })),
    [hostUsers],
  )

  const total = data?.total ?? 0

  return (
    <div className="container" style={{ padding: '8px 0' }}>
      <Shell>
        <ShellHeader
          eyebrow="места"
          title="Байк-посты"
          subtitle="Карта и список мото-постов сообщества."
          actions={<span className="shell__chip shell__chip--accent"><ShopOutlined /></span>}
        />

        <ShellSection label="карта">
          {mapMarkers.length > 0 || hostMarkers.length > 0 ? (
            <MapView
              markers={mapMarkers}
              hostUsers={hostMarkers}
              onHostClick={setSelectedHost}
              height={520}
              zoom={4}
            />
          ) : (
            <Typography.Text type="secondary">Нет мото-постов с координатами для отображения на карте.</Typography.Text>
          )}
        </ShellSection>

        <ShellSection label="список">
          <Input.Search
            allowClear
            placeholder="Поиск по названию или адресу"
            style={{ width: 320, maxWidth: '100%', marginBottom: 16 }}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <Spin spinning={isLoading || isFetching}>
            {motoPosts.length === 0 && !isLoading ? (
              <Empty description="Нет мото-постов по заданным условиям" />
            ) : (
              <Row gutter={[8, 8]}>
                {motoPosts.map((motoPost) => (
                  <Col key={motoPost.id} xs={12} sm={8} md={6} lg={4}>
                    <MotoPostCard motoPost={motoPost} />
                  </Col>
                ))}
              </Row>
            )}
          </Spin>

          {total > 0 && (
            <Pagination
              style={{ marginTop: 16 }}
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
        </ShellSection>
      </Shell>

      <Modal
        open={Boolean(selectedHost)}
        onCancel={() => setSelectedHost(null)}
        footer={null}
        title="Готов разместить мотопутешественников"
      >
        {selectedHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar
                size={56}
                src={selectedHost.avatar || undefined}
                icon={<UserOutlined />}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{selectedHost.name}</div>
                <Link to={`/users/${selectedHost.id}`} style={{ fontSize: 13, color: '#cd2e2c' }}>
                  Профиль →
                </Link>
              </div>
            </div>

            {selectedHost.address ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14 }}>
                <EnvironmentOutlined style={{ marginTop: 3, color: '#64748b' }} />
                <span>{selectedHost.address}</span>
              </div>
            ) : null}

            {selectedHost.phone ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                <PhoneOutlined style={{ color: '#64748b' }} />
                <a href={`tel:${selectedHost.phone}`}>{selectedHost.phone}</a>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default MotoPosts

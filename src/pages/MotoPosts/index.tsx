import { Button, Card, Image, Input, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ShopOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { API_URL } from '@config/constants'
import MapView, { type MapViewMarker } from '@components/YandexMapV3/MapView'
import { useGetMotoPostListQuery, type MotoPost } from '@features/motoPost/motoPostSlice'

function MotoPosts() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetMotoPostListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const motoPosts = useMemo(() => data?.data || [], [data?.data])

  const filteredMotoPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return motoPosts
    return motoPosts.filter((motoPost) => motoPost.name.toLowerCase().includes(normalizedSearch))
  }, [motoPosts, search])

  const motoPostsForMap = filteredMotoPosts.length > 0 ? filteredMotoPosts : motoPosts

  const mapMarkers: MapViewMarker[] = useMemo(
    () =>
      motoPostsForMap
        .filter((motoPost) => motoPost.location)
        .map((motoPost) => ({
          id: motoPost.id,
          title: motoPost.name,
          location: motoPost.location,
          logo: motoPost.logo ? `${API_URL}${motoPost.logo}` : null,
          href: `/moto-posts/${motoPost.id}`,
        })),
    [motoPostsForMap],
  )

  const columns: ColumnsType<MotoPost> = [
    {
      dataIndex: 'logo',
      key: 'logo',
      width: 50,
      render: (logo: string | null, record) =>
        logo ? (
          <Image
            src={`${API_URL}${logo}`}
            alt={record.name}
            width={30}
            height={30}
            style={{ objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Link to={`/moto-posts/${record.id}`}>
          <Button size="small" type="link">
            {name} {record.address ? `(${record.address})` : ''}
          </Button>
        </Link>
      ),
    },
    {
      title: 'Сайт',
      dataIndex: 'website',
      key: 'website',
      ellipsis: true,
      render: (website?: string | null) =>
        website ? (
          <a href={website} target="_blank" rel="noreferrer">
            {website}
          </a>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
  ]

  return (
    <div className="container" style={{ padding: '8px 0' }}>
      <div className="title_page">
        <div>
          <Typography.Text className="events-calendar-eyebrow">
            места
          </Typography.Text>
          <Typography.Title level={1} className="events-calendar-title">
            Мото-посты
          </Typography.Title>
          <Typography.Paragraph className="events-calendar-description">
            Карта и список мото-постов сообщества.
          </Typography.Paragraph>
        </div>
        <ShopOutlined className="title_page__icon" />
      </div>

      <Card style={{ marginBottom: 8 }}>
        {mapMarkers.length > 0 ? (
          <MapView markers={mapMarkers} height={520} zoom={4} />
        ) : (
          <Typography.Text type="secondary">Нет мото-постов с координатами для отображения на карте.</Typography.Text>
        )}
      </Card>

      <Card>
        <Table<MotoPost>
          showHeader={false}
          size="small"
          rowKey="id"
          loading={isLoading}
          dataSource={filteredMotoPosts}
          columns={columns}
          title={() => (
            <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Список мото-постов
              </Typography.Title>
              <Input.Search
                allowClear
                placeholder="Поиск по названию"
                style={{ width: 320, maxWidth: '100%' }}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Space>
          )}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total}`,
          }}
        />
      </Card>
    </div>
  )
}

export default MotoPosts

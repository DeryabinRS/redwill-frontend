import { Button, Card, Image, Input, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { API_URL } from '@config/constants'
import MapView, { type MapViewMarker } from '@components/YandexMapV3/MapView'
import { useGetMotoclubListQuery, type Motoclub } from '@features/motoclub/motoclubSlice'

function Motoclubs() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const motoclubs = useMemo(() => data?.data || [], [data?.data])

  const filteredMotoclubs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return motoclubs
    return motoclubs.filter((motoclub) => motoclub.name.toLowerCase().includes(normalizedSearch))
  }, [motoclubs, search])

  const motoclubsForMap = filteredMotoclubs.length > 0 ? filteredMotoclubs : motoclubs

  const mapMarkers: MapViewMarker[] = useMemo(
    () =>
      motoclubsForMap
        .filter((motoclub) => motoclub.location)
        .map((motoclub) => ({
          id: motoclub.id,
          title: motoclub.name,
          location: motoclub.location,
          logo: motoclub.logo ? `${API_URL}${motoclub.logo}` : null,
          href: `/motoclubs/${motoclub.id}`,
        })),
    [motoclubsForMap],
  )

  const columns: ColumnsType<Motoclub> = [
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
        <Link to={`/motoclubs/${record.id}`}>
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
      <Card style={{ marginBottom: 16 }}>
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Мотоклубы
        </Typography.Title>
        <Typography.Paragraph>
          Карта и список мотоклубов сообщества.
        </Typography.Paragraph>
        {mapMarkers.length > 0 ? (
          <MapView markers={mapMarkers} height={520} zoom={4} />
        ) : (
          <Typography.Text type="secondary">Нет мотоклубов с координатами для отображения на карте.</Typography.Text>
        )}
      </Card>

      <Card>
        <Table<Motoclub>
          showHeader={false}
          size="small"
          rowKey="id"
          loading={isLoading}
          dataSource={filteredMotoclubs}
          columns={columns}
          title={() => (
            <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Список мотоклубов
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

export default Motoclubs

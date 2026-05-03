import { Button, Card, Image, Input, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ToolOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { API_URL } from '@config/constants'
import MapView, { type MapViewMarker } from '@components/YandexMapV3/MapView'
import { useGetServiceStationListQuery, type ServiceStation } from '@features/serviceStation/serviceStationSlice'

function ServiceStations() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetServiceStationListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const serviceStations = useMemo(() => data?.data || [], [data?.data])

  const filteredServiceStations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return serviceStations
    return serviceStations.filter((serviceStation) => serviceStation.name.toLowerCase().includes(normalizedSearch))
  }, [serviceStations, search])

  const serviceStationsForMap = filteredServiceStations.length > 0 ? filteredServiceStations : serviceStations

  const mapMarkers: MapViewMarker[] = useMemo(
    () =>
      serviceStationsForMap
        .filter((serviceStation) => serviceStation.location)
        .map((serviceStation) => ({
          id: serviceStation.id,
          title: serviceStation.name,
          location: serviceStation.location,
          logo: serviceStation.logo ? `${API_URL}${serviceStation.logo}` : null,
          href: `/service-stations/${serviceStation.id}`,
        })),
    [serviceStationsForMap],
  )

  const columns: ColumnsType<ServiceStation> = [
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
        <Link to={`/service-stations/${record.id}`}>
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
        <Table<ServiceStation>
          showHeader={false}
          size="small"
          rowKey="id"
          loading={isLoading}
          dataSource={filteredServiceStations}
          columns={columns}
          title={() => (
            <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Список СТО
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

export default ServiceStations

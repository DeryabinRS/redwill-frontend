import { App as AntdApp, Button, Card, Col, Pagination, Popconfirm, Row, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EyeFilled, ToolOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { API_URL } from '@config/constants'
import {
  useDeleteServiceStationMutation,
  useGetUserServiceStationsQuery,
  type ServiceStation,
} from '@features/serviceStation/serviceStationSlice'
import { moderationStatusOptions, moderationStatusTagColor } from '@utils/form'
import '@components/PostFeed/PostFeed.css'

const { Title, Text } = Typography
const PAGE_SIZE = 4

function UserServiceStationCard({
  serviceStation,
  onDelete,
  isDeleting,
}: {
  serviceStation: ServiceStation
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  const navigate = useNavigate()
  const canView = serviceStation.publication_status === 1 && serviceStation.moderation_status === 2
  const moderation = moderationStatusOptions.find((item) => item.value === serviceStation.moderation_status)

  return (
    <Card
      size="small"
      className="post-card post-card--compact"
      hoverable
      onClick={() => {
        if (canView) navigate(`/service-stations/${serviceStation.id}`)
      }}
      cover={
        serviceStation.logo ? (
          <div className="post-card-image-container">
            <img
              src={`${API_URL}${serviceStation.logo}`}
              alt={serviceStation.name}
              className="post-card-image"
              loading="lazy"
              style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder">
            <ToolOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Title level={5} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
          {serviceStation.name}
        </Title>
        <Space size={4} wrap>
          <Tag color={serviceStation.publication_status === 1 ? 'green' : 'red'}>
            {serviceStation.publication_status === 1 ? 'Опубликована' : 'Не опубликована'}
          </Tag>
          {moderation ? (
            <Tag color={moderationStatusTagColor[serviceStation.moderation_status] ?? 'default'}>
              {moderation.label}
            </Tag>
          ) : null}
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {serviceStation.address?.trim() || `Создана: ${dayjs(serviceStation.created_at).format('DD.MM.YYYY')}`}
        </Text>
        <Space size="small" wrap onClick={(event) => event.stopPropagation()}>
          <Button
            disabled={!canView}
            icon={<EyeFilled />}
            size="small"
            onClick={() => navigate(`/service-stations/${serviceStation.id}`)}
          />
          <Popconfirm
            title="Удалить СТО?"
            description="Действие нельзя отменить"
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true, loading: isDeleting }}
            onConfirm={() => onDelete(serviceStation.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      </Space>
    </Card>
  )
}

function UserServiceStations() {
  const { message } = AntdApp.useApp()
  const [page, setPage] = useState(1)
  const { data: serviceStationsData, isLoading, isError } = useGetUserServiceStationsQuery({
    pagination: { page, per_page: PAGE_SIZE },
  })
  const [deleteServiceStation, { isLoading: isDeleting }] = useDeleteServiceStationMutation()

  const serviceStations = serviceStationsData?.data || []
  const total = serviceStationsData?.total ?? 0

  const handleDeleteServiceStation = async (serviceStationId: number) => {
    try {
      await deleteServiceStation(serviceStationId).unwrap()
      message.success('СТО удалена')
    } catch {
      message.error('Не удалось удалить СТО')
    }
  }

  if (isLoading || isError || total === 0) {
    return null
  }

  return (
    <section className="profile-list-section">
      <Typography.Title level={4} className="profile-list-section__title">
        Мои СТО
      </Typography.Title>
      <Row gutter={[12, 12]}>
        {serviceStations.map((serviceStation) => (
          <Col key={serviceStation.id} xs={24} sm={12}>
            <UserServiceStationCard
              serviceStation={serviceStation}
              isDeleting={isDeleting}
              onDelete={(id) => void handleDeleteServiceStation(id)}
            />
          </Col>
        ))}
      </Row>
      {total > PAGE_SIZE ? (
        <Pagination
          className="profile-list-section__pagination"
          size="small"
          current={serviceStationsData?.current_page || page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      ) : null}
    </section>
  )
}

export default UserServiceStations

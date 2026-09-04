import { App as AntdApp, Button, Card, Pagination, Popconfirm, Space, Typography } from 'antd'
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
import { ProfileCardStatusBadges } from '@components/ProfileCardOverlays'
import { DELETE_CONFIRM_DESCRIPTION } from '@utils/form'
import ProfileListSection from '../ProfileListSection'
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
      <div className="profile-card-body">
        <ProfileCardStatusBadges
          publicationStatus={serviceStation.publication_status}
          moderationStatus={serviceStation.moderation_status}
          publishedLabel="Опубликована"
          unpublishedLabel="Не опубликована"
        />
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Title level={5} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
            {serviceStation.name}
          </Title>
          <Text type="secondary" className="profile-card-meta">
            {serviceStation.address?.trim() || `Создана: ${dayjs(serviceStation.created_at).format('DD.MM.YYYY')}`}
          </Text>
          <Space className="profile-card-actions" size="small" wrap onClick={(event) => event.stopPropagation()}>
            <Button
              disabled={!canView}
              icon={<EyeFilled />}
              size="small"
              onClick={() => navigate(`/service-stations/${serviceStation.id}`)}
            />
            <Popconfirm
              title="Удалить СТО?"
              description={DELETE_CONFIRM_DESCRIPTION}
              okText="Удалить"
              cancelText="Отмена"
              okButtonProps={{ danger: true, loading: isDeleting }}
              onConfirm={() => onDelete(serviceStation.id)}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        </Space>
      </div>
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
    <ProfileListSection
      title="СТО"
      count={total}
      pagination={
        total > PAGE_SIZE ? (
          <Pagination
            className="profile-list-section__pagination"
            size="small"
            current={serviceStationsData?.current_page || page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        ) : null
      }
    >
      {serviceStations.map((serviceStation) => (
        <UserServiceStationCard
          key={serviceStation.id}
          serviceStation={serviceStation}
          isDeleting={isDeleting}
          onDelete={(id) => void handleDeleteServiceStation(id)}
        />
      ))}
    </ProfileListSection>
  )
}

export default UserServiceStations

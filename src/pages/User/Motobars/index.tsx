import { App as AntdApp, Button, Card, Pagination, Popconfirm, Space, Typography } from 'antd'
import { CoffeeOutlined, DeleteOutlined, EyeFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { API_URL } from '@config/constants'
import {
  useDeleteMotobarMutation,
  useGetUserMotobarsQuery,
  type Motobar,
} from '@features/motobar/motobarSlice'
import { ProfileCardStatusBadges } from '@components/ProfileCardOverlays'
import { DELETE_CONFIRM_DESCRIPTION } from '@utils/form'
import ProfileListSection from '../Profile/ProfileListSection'
import '@components/PostFeed/PostFeed.css'

const { Title, Text } = Typography
const PAGE_SIZE = 4

function UserMotobarCard({
  motobar,
  onDelete,
  isDeleting,
}: {
  motobar: Motobar
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  const navigate = useNavigate()
  const canView = motobar.publication_status === 1 && motobar.moderation_status === 2

  return (
    <Card
      size="small"
      className="post-card post-card--compact"
      hoverable
      onClick={() => {
        if (canView) navigate(`/motobars/${motobar.id}`)
      }}
      cover={
        motobar.logo ? (
          <div className="post-card-image-container">
            <img
              src={`${API_URL}${motobar.logo}`}
              alt={motobar.name}
              className="post-card-image"
              loading="lazy"
              style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder">
            <CoffeeOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <div className="profile-card-body">
        <ProfileCardStatusBadges
          publicationStatus={motobar.publication_status}
          moderationStatus={motobar.moderation_status}
        />
        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <Title level={5} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
            {motobar.name}
          </Title>
          <Text type="secondary" className="profile-card-meta">
            {motobar.address?.trim() || `Создан: ${dayjs(motobar.created_at).format('DD.MM.YYYY')}`}
          </Text>
          <Space className="profile-card-actions" size="small" wrap onClick={(event) => event.stopPropagation()}>
            <Button
              disabled={!canView}
              icon={<EyeFilled />}
              size="small"
              onClick={() => navigate(`/motobars/${motobar.id}`)}
            />
            <Popconfirm
              title="Удалить мото-бар?"
              description={DELETE_CONFIRM_DESCRIPTION}
              okText="Удалить"
              cancelText="Отмена"
              okButtonProps={{ danger: true, loading: isDeleting }}
              onConfirm={() => onDelete(motobar.id)}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        </Space>
      </div>
    </Card>
  )
}

function UserMotobars() {
  const { message } = AntdApp.useApp()
  const [page, setPage] = useState(1)
  const { data: motobarsData, isLoading, isError } = useGetUserMotobarsQuery({
    pagination: { page, per_page: PAGE_SIZE },
  })
  const [deleteMotobar, { isLoading: isDeleting }] = useDeleteMotobarMutation()

  const motobars = motobarsData?.data || []
  const total = motobarsData?.total ?? 0

  const handleDeleteMotobar = async (motobarId: number) => {
    try {
      await deleteMotobar(motobarId).unwrap()
      message.success('Мото-бар удален')
    } catch {
      message.error('Не удалось удалить мото-бар')
    }
  }

  if (isLoading || isError || total === 0) {
    return null
  }

  return (
    <ProfileListSection
      title="Мои мото-бары"
      count={total}
      pagination={
        total > PAGE_SIZE ? (
          <Pagination
            className="profile-list-section__pagination"
            size="small"
            current={motobarsData?.current_page || page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        ) : null
      }
    >
      {motobars.map((motobar) => (
        <UserMotobarCard
          key={motobar.id}
          motobar={motobar}
          isDeleting={isDeleting}
          onDelete={(id) => void handleDeleteMotobar(id)}
        />
      ))}
    </ProfileListSection>
  )
}

export default UserMotobars

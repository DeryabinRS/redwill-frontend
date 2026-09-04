import { App as AntdApp, Button, Card, Pagination, Popconfirm, Space, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, EyeFilled, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { API_URL } from '@config/constants'
import {
  useDeleteMotoclubMutation,
  useGetUserMotoclubsQuery,
  type Motoclub,
} from '@features/motoclub/motoclubSlice'
import { useGetUserInfoQuery } from '@features/user/userSlice'
import { ProfileCardStatusBadges } from '@components/ProfileCardOverlays'
import ProfileListSection from '../ProfileListSection'
import '@components/PostFeed/PostFeed.css'

const { Title, Text } = Typography
const PAGE_SIZE = 4

function UserMotoclubCard({
  motoclub,
  userId,
  onDelete,
  isDeleting,
}: {
  motoclub: Motoclub
  userId?: number
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  const navigate = useNavigate()
  const isOwner = userId != null && motoclub.user_id === userId
  const canDelete =
    isOwner &&
    (motoclub.pending_members_count ?? 0) === 0 &&
    (motoclub.verified_members_count ?? 0) <= 1
  const canView = motoclub.publication_status === 1 && motoclub.moderation_status === 2
  const canEdit = !(motoclub.moderation_status === 0 && motoclub.publication_status !== 1)
  const deleteTitle = !isOwner
    ? 'Удалить мотоклуб может только создатель'
    : canDelete
      ? 'Удалить мотоклуб'
      : 'Нельзя удалить мотоклуб, пока в нём есть другие участники или заявки'

  return (
    <Card
      size="small"
      className="post-card post-card--compact"
      hoverable
      onClick={() => {
        if (canView) navigate(`/motoclubs/${motoclub.id}`)
      }}
      cover={
        motoclub.logo ? (
          <div className="post-card-image-container">
            <img
              src={`${API_URL}${motoclub.logo}`}
              alt={motoclub.name}
              className="post-card-image"
              loading="lazy"
              style={{ objectFit: 'contain', background: 'rgba(0,0,0,0.04)' }}
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder">
            <ShopOutlined style={{ fontSize: 28, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <div className="profile-card-body">
        <ProfileCardStatusBadges
          publicationStatus={motoclub.publication_status}
          moderationStatus={motoclub.moderation_status}
        />
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Title level={5} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
            {motoclub.name}
          </Title>
          <Text type="secondary" className="profile-card-meta">
            Участники: {motoclub.verified_members_count ?? 0}
            {(motoclub.pending_members_count ?? 0) > 0
              ? ` · Заявки: ${motoclub.pending_members_count}`
              : ''}
          </Text>
          <Space className="profile-card-actions" size="small" wrap onClick={(event) => event.stopPropagation()}>
            <Button
              disabled={!canView}
              icon={<EyeFilled />}
              size="small"
              onClick={() => navigate(`/motoclubs/${motoclub.id}`)}
            />
            <Button
              icon={<TeamOutlined />}
              size="small"
              title="Участники"
              onClick={() => navigate(`/motoclubs/${motoclub.id}/members`)}
            />
            <Tooltip title="Редактировать">
              <Button
                disabled={!canEdit}
                icon={<EditOutlined />}
                size="small"
                onClick={() => navigate(`/motoclubs/${motoclub.id}/edit`)}
              />
            </Tooltip>
            <Tooltip title={deleteTitle}>
              <span>
                <Popconfirm
                  title="Удалить мотоклуб?"
                  description="Действие нельзя отменить"
                  okText="Удалить"
                  cancelText="Отмена"
                  okButtonProps={{ danger: true, loading: isDeleting }}
                  disabled={!canDelete}
                  onConfirm={() => onDelete(motoclub.id)}
                >
                  <Button danger disabled={!canDelete} icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </span>
            </Tooltip>
          </Space>
        </Space>
      </div>
    </Card>
  )
}

function UserMotoclubs() {
  const { message } = AntdApp.useApp()
  const [page, setPage] = useState(1)
  const { data: userInfo } = useGetUserInfoQuery()
  const { data: motoclubsData, isLoading, isError } = useGetUserMotoclubsQuery({
    pagination: { page, per_page: PAGE_SIZE },
  })
  const [deleteMotoclub, { isLoading: isDeleting }] = useDeleteMotoclubMutation()

  const motoclubs = motoclubsData?.data || []
  const total = motoclubsData?.total ?? 0

  const handleDeleteMotoclub = async (motoclubId: number) => {
    try {
      await deleteMotoclub(motoclubId).unwrap()
      message.success('Мотоклуб удален')
    } catch {
      message.error('Не удалось удалить мотоклуб')
    }
  }

  if (isLoading || isError || total === 0) {
    return null
  }

  return (
    <ProfileListSection
      title="Мотоклубы"
      count={total}
      pagination={
        total > PAGE_SIZE ? (
          <Pagination
            className="profile-list-section__pagination"
            size="small"
            current={motoclubsData?.current_page || page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        ) : null
      }
    >
      {motoclubs.map((motoclub) => (
        <UserMotoclubCard
          key={motoclub.id}
          motoclub={motoclub}
          userId={userInfo?.id}
          isDeleting={isDeleting}
          onDelete={(id) => void handleDeleteMotoclub(id)}
        />
      ))}
    </ProfileListSection>
  )
}

export default UserMotoclubs

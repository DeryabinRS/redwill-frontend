import { App as AntdApp, Button, Card, Pagination, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EyeFilled, ShopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { API_URL } from '@config/constants'
import {
  useDeleteMotoPostMutation,
  useGetUserMotoPostsQuery,
  type MotoPost,
} from '@features/motoPost/motoPostSlice'
import { ProfileCardStatusBadges } from '@components/ProfileCardOverlays'
import { DELETE_CONFIRM_DESCRIPTION } from '@utils/form'
import ProfileListSection from '../Profile/ProfileListSection'
import '@components/PostFeed/PostFeed.css'

const { Title, Text } = Typography
const PAGE_SIZE = 4

function UserMotoPostCard({
  motoPost,
  onDelete,
  isDeleting,
}: {
  motoPost: MotoPost
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  const navigate = useNavigate()
  const canView = motoPost.publication_status === 1 && motoPost.moderation_status === 2

  return (
    <Card
      size="small"
      className="post-card post-card--compact"
      hoverable
      onClick={() => {
        if (canView) navigate(`/moto-posts/${motoPost.slug}`)
      }}
      cover={
        motoPost.logo ? (
          <div className="post-card-image-container">
            <img
              src={`${API_URL}${motoPost.logo}`}
              alt={motoPost.name}
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
          publicationStatus={motoPost.publication_status}
          moderationStatus={motoPost.moderation_status}
        />
        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <Title level={5} className="post-card-title" style={{ margin: 0, fontSize: 14, lineHeight: 1.2 }}>
            {motoPost.name}
          </Title>
          <Text type="secondary" className="profile-card-meta">
            {motoPost.address?.trim() || `Создан: ${dayjs(motoPost.created_at).format('DD.MM.YYYY')}`}
          </Text>
          <Space className="profile-card-actions" size="small" wrap onClick={(event) => event.stopPropagation()}>
            <Button
              disabled={!canView}
              icon={<EyeFilled />}
              size="small"
              onClick={() => navigate(`/moto-posts/${motoPost.slug}`)}
            />
            <Popconfirm
              title="Удалить мото-пост?"
              description={DELETE_CONFIRM_DESCRIPTION}
              okText="Удалить"
              cancelText="Отмена"
              okButtonProps={{ danger: true, loading: isDeleting }}
              onConfirm={() => onDelete(motoPost.id)}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        </Space>
      </div>
    </Card>
  )
}

function UserMotoPosts() {
  const { message } = AntdApp.useApp()
  const [page, setPage] = useState(1)
  const { data: motoPostsData, isLoading, isError } = useGetUserMotoPostsQuery({
    pagination: { page, per_page: PAGE_SIZE },
  })
  const [deleteMotoPost, { isLoading: isDeleting }] = useDeleteMotoPostMutation()

  const motoPosts = motoPostsData?.data || []
  const total = motoPostsData?.total ?? 0

  const handleDeleteMotoPost = async (motoPostId: number) => {
    try {
      await deleteMotoPost(motoPostId).unwrap()
      message.success('Мото-пост удалён')
    } catch {
      message.error('Не удалось удалить мото-пост')
    }
  }

  if (isLoading || isError || total === 0) {
    return null
  }

  return (
    <ProfileListSection
      title="Байк-посты"
      count={total}
      pagination={
        total > PAGE_SIZE ? (
          <Pagination
            className="profile-list-section__pagination"
            size="small"
            current={motoPostsData?.current_page || page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        ) : null
      }
    >
      {motoPosts.map((motoPost) => (
        <UserMotoPostCard
          key={motoPost.id}
          motoPost={motoPost}
          isDeleting={isDeleting}
          onDelete={(id) => void handleDeleteMotoPost(id)}
        />
      ))}
    </ProfileListSection>
  )
}

export default UserMotoPosts

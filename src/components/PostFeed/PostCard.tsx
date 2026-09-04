import { Button, Card, Popconfirm, Space, Typography } from 'antd'
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Post } from '../../features/post/postSlice'
import { API_URL } from '../../config/constants'
import { ProfileCardStatusBadges } from '../ProfileCardOverlays'
import { DELETE_CONFIRM_DESCRIPTION } from '../../utils/form'

const { Title, Text } = Typography

type PostCardProps = {
  post: Post
  compact?: boolean
  showStatus?: boolean
  onDelete?: (id: number) => void
  isDeleting?: boolean
}

function PostCard({
  post,
  compact = false,
  showStatus = false,
  onDelete,
  isDeleting = false,
}: PostCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      size="small"
      className={compact ? 'post-card post-card--compact' : 'post-card'}
      hoverable
      onClick={() => navigate(`/posts/${post.id}`)}
      cover={
        post.image ? (
          <div className="post-card-image-container">
            <img
              src={`${API_URL}${post.image}`}
              alt={post.title}
              className="post-card-image"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="post-card-image-placeholder">
            <CalendarOutlined style={{ fontSize: compact ? 28 : 48, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <div className="profile-card-body">
        {showStatus ? (
          <ProfileCardStatusBadges
            publicationStatus={post.publication_status}
            moderationStatus={post.moderation_status}
          />
        ) : null}
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <Title
            level={4}
            className="post-card-title"
            style={{ margin: 0, fontSize: compact ? '14px' : '16px', lineHeight: 1.2 }}
          >
            {post.title}
          </Title>

          <div className="post-card-meta">
            <Space orientation="vertical" size={4} style={{ width: '100%' }}>
              {(post.date_start || post.time_start) && (
                <div className="post-card-date">
                  <CalendarOutlined className="post-card-icon" />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {post.date_start && dayjs(post.date_start).format('DD.MM.YYYY')}
                    {post.time_start && ` ${dayjs().hour(parseInt(post.time_start.split(':')[0])).minute(parseInt(post.time_start.split(':')[1])).format('HH:mm')}`}
                    {post.date_end && ` - ${dayjs(post.date_end).format('DD.MM.YYYY')}`}
                  </Text>
                </div>
              )}
            </Space>
          </div>

          {onDelete ? (
            <Space
              className="profile-card-actions"
              size="small"
              onClick={(event) => event.stopPropagation()}
            >
              <Popconfirm
                title="Удалить событие?"
                description={DELETE_CONFIRM_DESCRIPTION}
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true, loading: isDeleting }}
                onConfirm={() => onDelete(post.id)}
              >
                <Button danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            </Space>
          ) : null}
        </Space>
      </div>
    </Card>
  )
}

export default PostCard

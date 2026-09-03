import { Card, Space, Tag, Typography } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Post } from '../../features/post/postSlice'
import { API_URL } from '../../config/constants'
import { moderationStatusOptions, moderationStatusTagColor } from '../../utils/form'

const { Title, Text } = Typography

type PostCardProps = {
  post: Post
  compact?: boolean
  showStatus?: boolean
}

function PostCard({ post, compact = false, showStatus = false }: PostCardProps) {
  const navigate = useNavigate()
  const moderation = moderationStatusOptions.find((item) => item.value === post.moderation_status)

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
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title
          level={4}
          className="post-card-title"
          style={{ margin: 0, fontSize: compact ? '14px' : '16px', lineHeight: 1.2 }}
        >
          {post.title}
        </Title>

        <div className="post-card-meta">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {(post.date_start || post.time_start) && (
              <div className="post-card-date">
                <CalendarOutlined className="post-card-icon" />
                <Text type="secondary">
                  {post.date_start && dayjs(post.date_start).format('DD.MM.YYYY')}
                  {post.time_start && ` ${dayjs().hour(parseInt(post.time_start.split(':')[0])).minute(parseInt(post.time_start.split(':')[1])).format('HH:mm')}`}
                  {post.date_end && ` - ${dayjs(post.date_end).format('DD.MM.YYYY')}`}
                </Text>
              </div>
            )}
          </Space>
        </div>

        {showStatus ? (
          <Space size={4} wrap>
            <Tag color={post.publication_status === 1 ? 'green' : 'red'}>
              {post.publication_status === 1 ? 'Опубликован' : 'Не опубликован'}
            </Tag>
            {moderation ? (
              <Tag color={moderationStatusTagColor[post.moderation_status] ?? 'default'}>
                {moderation.label}
              </Tag>
            ) : null}
          </Space>
        ) : null}
      </Space>
    </Card>
  )
}

export default PostCard

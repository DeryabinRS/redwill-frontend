import { Card, Space, Typography } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Post } from '../../features/post/postSlice'
import { API_URL } from '../../config/constants'

const { Title, Text } = Typography

type PostCardProps = {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="post-card"
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
            <CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          </div>
        )
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: '16px', lineHeight: 1.2 }}>
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

            {post.location && (
              <div className="post-card-location">
                <EnvironmentOutlined className="post-card-icon" />
                <Text type="secondary">{post.location}</Text>
              </div>
            )}

            {post.profile && (
              <div className="post-card-author">
                <UserOutlined className="post-card-icon" />
                <Text type="secondary">
                  {post.profile.first_name} {post.profile.last_name}
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  )
}

export default PostCard

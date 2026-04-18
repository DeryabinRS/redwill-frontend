import { useState } from 'react'
import { Card, Col, Typography, Button, Space, Tag, Row } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useGetPaginatedPostsQuery } from '../../features/post/postSlice'
import './PostFeed.css'
import { API_URL } from '../../config/constants'

const { Title, Text, Paragraph } = Typography

interface PostFeedProps {
  title?: string
  initialPage?: number
}

const PostFeed: React.FC<PostFeedProps> = ({
  title = 'Будущие мероприятия',
  initialPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const { data, isLoading, isFetching, error } = useGetPaginatedPostsQuery(currentPage)

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  if (error) {
    return (
      <div className="post-feed-error">
        <Text type="danger">Ошибка загрузки мероприятий</Text>
      </div>
    )
  }

  const posts = data?.data || []
  const hasNextPage = data?.next_page_url !== null

  // Ensure posts is an array before rendering
  if (!Array.isArray(posts)) {
    return null
  }

  return (
    <div className="post-feed">
      <Title level={2} className="post-feed-title">
        {title}
      </Title>

      <Row gutter={[16, 16]}>
        {posts.map((post, index) => (
          <Col
            key={post.id}
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={8}
            className={`post-feed-item animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Card
              className="post-card"
              hoverable
              cover={
                post.image ? (
                  <div className="post-card-image-container">
                    <img 
                      src={`${API_URL}${post.image}`} 
                      alt={post.title}
                      className="post-card-image"
                      loading="lazy"
                    />
                    {post.category && (
                      <Tag className="post-category-tag" color="blue">
                        {post.category.name}
                      </Tag>
                    )}
                  </div>
                ) : (
                  <div className="post-card-image-placeholder">
                    <CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  </div>
                )
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Title level={4} className="post-card-title" style={{ margin: 0, fontSize: '18px' }}>
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
                          {post.date_end && ` — ${dayjs(post.date_end).format('DD.MM.YYYY')}`}
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

                {post.content && (
                  <Paragraph 
                    className="post-card-content" 
                    ellipsis={{ rows: 3, expandable: true }}
                    style={{ margin: 0 }}
                  >
                    {post.content.replace(/<[^>]*>/g, '')}
                  </Paragraph>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {isLoading && posts.length === 0 && (
        <div className="post-feed-loading">
          <div className="loading-spinner" />
          <Text type="secondary">Загрузка мероприятий...</Text>
        </div>
      )}

      {isFetching && posts.length > 0 && (
        <div className="post-feed-fetching">
          <div className="loading-spinner" />
        </div>
      )}

      {!isLoading && hasNextPage && (
        <div className="post-feed-load-more">
          <Button 
            type="primary" 
            size="large"
            onClick={handleLoadMore}
            loading={isFetching}
            className="load-more-button"
          >
            Загрузить ещё
          </Button>
        </div>
      )}

      {!isLoading && !hasNextPage && posts.length > 0 && (
        <div className="post-feed-no-more">
          <Text type="secondary">Больше мероприятий нет</Text>
        </div>
      )}

      {!isLoading && posts.length === 0 && !error && (
        <div className="post-feed-empty">
          <Text type="secondary">Мероприятия пока не добавлены</Text>
        </div>
      )}
    </div>
  )
}

export default PostFeed

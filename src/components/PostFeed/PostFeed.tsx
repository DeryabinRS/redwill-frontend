import { useState } from 'react'
import { Col, Typography, Button, Row, Spin } from 'antd'
import { useGetPostListQuery } from '../../features/post/postSlice'
import PostCard from './PostCard'
import './PostFeed.css'

const { Title, Text } = Typography

interface PostFeedProps {
  title?: string
  initialPage?: number
}

const PostFeed: React.FC<PostFeedProps> = ({
  title = 'Будущие мероприятия',
  initialPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const { data, isLoading, isFetching, error } = useGetPostListQuery({ pagination: { page: currentPage }, post_category_ids: 2 });

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
      <div className="post-feed-header">
        <Title level={2} className="post-feed-title">
          {title}
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        {posts.map((post, index) => (
          <Col
            key={post.id}
            xs={24}
            sm={24}
            md={12}
            lg={8}
            xl={6}
            className={`post-feed-item animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PostCard post={post} />
          </Col>
        ))}
      </Row>

      {isFetching && (
        <Spin />
      )}

      {!isLoading && hasNextPage && (
        <div className="post-feed-load-more">
          <Button 
            type="text"
            size="large"
            onClick={handleLoadMore}
            loading={isFetching}
            className="load-more-button"
          >
            Загрузить ещё
          </Button>
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

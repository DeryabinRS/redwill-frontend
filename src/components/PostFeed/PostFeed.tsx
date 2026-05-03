import { useMemo } from 'react'
import { Col, Typography, Row, Spin } from 'antd'
import { useGetPostListQuery } from '../../features/post/postSlice'
import PostCard from './PostCard'
import './PostFeed.css'

const { Text } = Typography

interface PostFeedProps {
  initialPage?: number
}

const PostFeed: React.FC<PostFeedProps> = ({
  initialPage = 1,
}) => {
  const { data, isLoading, isFetching, error } = useGetPostListQuery({
    pagination: { page: initialPage, per_page: 12 },
    post_category_ids: 2,
  })

  const posts = useMemo(() => {
    const source = data?.data || []

    if (!Array.isArray(source)) {
      return []
    }

    return [...source]
      .sort((a, b) => {
        const first = `${a.date_start || ''} ${a.time_start || ''}`
        const second = `${b.date_start || ''} ${b.time_start || ''}`

        return first.localeCompare(second)
      })
      .slice(0, 12)
  }, [data?.data])

  if (error) {
    return (
      <div className="post-feed-error">
        <Text type="danger">Ошибка загрузки мероприятий</Text>
      </div>
    )
  }

  return (
    <div className="post-feed">
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

      {!isLoading && posts.length === 0 && !error && (
        <div className="post-feed-empty">
          <Text type="secondary">Мероприятия пока не добавлены</Text>
        </div>
      )}
    </div>
  )
}

export default PostFeed

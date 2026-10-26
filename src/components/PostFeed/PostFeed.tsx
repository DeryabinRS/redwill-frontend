import { useMemo, useState } from 'react'
import { Col, Grid, Pagination, Row, Spin, Typography } from 'antd'
import { useGetPostListQuery } from '../../features/post/postSlice'
import PostCard from './PostCard'
import './PostFeed.css'

const { Text } = Typography
const { useBreakpoint } = Grid

interface PostFeedProps {
  initialPage?: number
  motoclubId?: number
  motobarId?: number
  perPage?: number
  emptyText?: string
  compact?: boolean
  /** На небольших экранах (до md включительно) показывать карточки компактно, как в календаре. */
  responsiveCompact?: boolean
  paginated?: boolean
}

const PostFeed: React.FC<PostFeedProps> = ({
  initialPage = 1,
  motoclubId,
  motobarId,
  perPage = 12,
  emptyText = 'Мероприятия пока не добавлены',
  compact = false,
  responsiveCompact = false,
  paginated = false,
}) => {
  const screens = useBreakpoint()
  const isCompact = responsiveCompact ? !screens.lg : compact
  const [page, setPage] = useState(initialPage)

  const { data, isLoading, isFetching, error } = useGetPostListQuery({
    pagination: { page, per_page: perPage },
    post_category_ids: 2,
    motoclub_ids: motoclubId,
    motobar_ids: motobarId,
    sort: 'date_start',
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
      .slice(0, perPage)
  }, [data?.data, perPage])

  const total = data?.total ?? 0

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
            sm={isCompact ? 12 : 24}
            md={12}
            lg={8}
            xl={isCompact ? 8 : 6}
            className={`post-feed-item animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PostCard post={post} compact={isCompact} />
          </Col>
        ))}
      </Row>

      {isFetching && (
        <Spin />
      )}

      {!isLoading && posts.length === 0 && !error && (
        <div className="post-feed-empty">
          <Text type="secondary">{emptyText}</Text>
        </div>
      )}

      {paginated && total > perPage && (
        <Pagination
          style={{ marginTop: 16, textAlign: 'center' }}
          current={page}
          pageSize={perPage}
          total={total}
          showSizeChanger={false}
          onChange={(nextPage) => setPage(nextPage)}
        />
      )}
    </div>
  )
}

export default PostFeed

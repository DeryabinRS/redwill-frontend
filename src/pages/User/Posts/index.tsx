import { Col, Pagination, Row, Typography } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useGetUserPostsQuery } from '@features/post/postSlice'
import PostCard from '@components/PostFeed/PostCard'
import '@components/PostFeed/PostFeed.css'

const PAGE_SIZE = 4

function UserPosts() {
  const [page, setPage] = useState(1)
  const { data: postsData, isLoading, isError } = useGetUserPostsQuery({
    pagination: { page, per_page: PAGE_SIZE },
    min_start_date: dayjs().format('YYYY-MM-DD'),
  })

  const posts = postsData?.data || []
  const total = postsData?.total ?? 0

  if (isLoading || isError || total === 0) {
    return null
  }

  return (
    <section className="profile-list-section">
      <Typography.Title level={4} className="profile-list-section__title">
        Мои события
      </Typography.Title>
      <Row gutter={[12, 12]}>
        {posts.map((post) => (
          <Col key={post.id} xs={24} sm={12}>
            <PostCard post={post} compact showStatus />
          </Col>
        ))}
      </Row>
      {total > PAGE_SIZE ? (
        <Pagination
          className="profile-list-section__pagination"
          size="small"
          current={postsData?.current_page || page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      ) : null}
    </section>
  )
}

export default UserPosts

import { Pagination } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useGetUserPostsQuery } from '@features/post/postSlice'
import PostCard from '@components/PostFeed/PostCard'
import ProfileListSection from '../ProfileListSection'
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
    <ProfileListSection
      title="События"
      count={total}
      pagination={
        total > PAGE_SIZE ? (
          <Pagination
            className="profile-list-section__pagination"
            size="small"
            current={postsData?.current_page || page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        ) : null
      }
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} compact showStatus />
      ))}
    </ProfileListSection>
  )
}

export default UserPosts

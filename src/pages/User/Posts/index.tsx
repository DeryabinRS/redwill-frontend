import { App as AntdApp, Pagination } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useDeletePostMutation, useGetUserPostsQuery } from '@features/post/postSlice'
import PostCard from '@components/PostFeed/PostCard'
import ProfileListSection from '../Profile/ProfileListSection'
import '@components/PostFeed/PostFeed.css'

const PAGE_SIZE = 4

function UserPosts() {
  const { message } = AntdApp.useApp()
  const [page, setPage] = useState(1)
  const { data: postsData, isLoading, isError } = useGetUserPostsQuery({
    pagination: { page, per_page: PAGE_SIZE },
    min_start_date: dayjs().format('YYYY-MM-DD'),
  })
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  const posts = postsData?.data || []
  const total = postsData?.total ?? 0

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId).unwrap()
      message.success('Событие удалено')
    } catch {
      message.error('Не удалось удалить событие')
    }
  }

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
        <PostCard
          key={post.id}
          post={post}
          compact
          showStatus
          isDeleting={isDeleting}
          onDelete={(id) => void handleDeletePost(id)}
        />
      ))}
    </ProfileListSection>
  )
}

export default UserPosts

import { useMemo } from 'react'
import { Col, Row, Spin, Tabs, Typography } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useGetPostListQuery, type Post } from '../../features/post/postSlice'
import PostCard from '../PostFeed/PostCard'
import PostFeed from '../PostFeed'
import './EventTabs.css'

dayjs.locale('ru')

const EVENT_CATEGORY_ID = 2

type EventMonthGroup = {
  key: string
  label: string
  count: number
  posts: Post[]
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function sortPosts(posts: Post[]) {
  return [...posts].sort((a, b) => {
    const first = `${a.date_start || ''} ${a.time_start || ''}`
    const second = `${b.date_start || ''} ${b.time_start || ''}`

    return first.localeCompare(second)
  })
}

function EventTabs() {
  const { data, isLoading, error } = useGetPostListQuery({
    pagination: { page: 1, per_page: 500 },
    post_category_ids: EVENT_CATEGORY_ID,
  })

  const total = data?.total ?? 0

  const months = useMemo<EventMonthGroup[]>(() => {
    const source = (data?.data ?? []).filter(
      (post) =>
        post.post_category_id === EVENT_CATEGORY_ID ||
        post.category?.id === EVENT_CATEGORY_ID,
    )

    const byMonth = new Map<string, Post[]>()

    const currentMonth = dayjs().startOf('month')

    source.forEach((post) => {
      const start = dayjs(post.date_start || post.date_end)
      const end = dayjs(post.date_end || post.date_start)

      if (!start.isValid() || !end.isValid()) {
        return
      }

      const first = start.startOf('month')
      const last = end.startOf('month')
      let cursor = first.isAfter(last) ? last : first
      const upper = first.isAfter(last) ? first : last

      // Пропускаем полностью прошедшие мероприятия, а у текущих
      // обрезаем диапазон до текущего месяца, чтобы не создавать
      // вкладки прошедших месяцев.
      if (upper.isBefore(currentMonth, 'month')) {
        return
      }
      if (cursor.isBefore(currentMonth, 'month')) {
        cursor = currentMonth
      }

      while (cursor.isSame(upper, 'month') || cursor.isBefore(upper, 'month')) {
        const key = cursor.format('YYYY-MM')

        if (!byMonth.has(key)) {
          byMonth.set(key, [])
        }

        byMonth.get(key)?.push(post)
        cursor = cursor.add(1, 'month')
      }
    })

    const groups = Array.from(byMonth.entries()).map(([key, posts]) => ({
      key,
      label: capitalize(dayjs(`${key}-01`).format('MMMM')),
      count: posts.length,
      posts: sortPosts(posts),
    }))

    groups.sort((a, b) => a.key.localeCompare(b.key))

    // Если одно и то же название месяца встречается в разные годы,
    // добавляем год, чтобы вкладки оставались различимыми.
    const labelOccurrences = groups.reduce<Record<string, number>>((acc, group) => {
      acc[group.label] = (acc[group.label] ?? 0) + 1
      return acc
    }, {})

    return groups.map((group) =>
      labelOccurrences[group.label] > 1
        ? { ...group, label: `${group.label} ${group.key.slice(0, 4)}` }
        : group,
    )
  }, [data?.data])

  if (error) {
    return <Typography.Text type="danger">Ошибка загрузки мероприятий</Typography.Text>
  }

  if (isLoading) {
    return (
      <div className="event-tabs__loading">
        <Spin />
      </div>
    )
  }

  const items = [
    {
      key: 'all',
      label: `Все (${total})`,
      children: <PostFeed compact perPage={12} paginated />,
    },
    ...months.map((month) => ({
      key: month.key,
      label: `${month.label} (${month.count})`,
      children: (
        <div className="post-feed event-tabs__grid-wrap">
          <Row gutter={[16, 16]}>
            {month.posts.map((post) => (
              <Col key={post.id} xs={24} md={12} xl={8}>
                <PostCard post={post} compact />
              </Col>
            ))}
          </Row>
        </div>
      ),
    })),
  ]

  return (
    <div className="event-tabs">
      <Tabs className="event-tabs__tabs" defaultActiveKey="all" items={items} />
    </div>
  )
}

export default EventTabs
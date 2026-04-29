import { useMemo, useState } from 'react'
import { Button, Calendar, Card, Col, Empty, Row, Spin, Typography } from 'antd'
import type { CalendarProps } from 'antd'
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/ru'
import { useGetPostListQuery, type Post } from '../../features/post/postSlice'
import PostCard from '../../components/PostFeed/PostCard'
import './Calendar.css'

dayjs.locale('ru')

const EVENT_CATEGORY_ID = 2

function isPostActiveOnDate(post: Post, date: Dayjs) {
  const startDate = dayjs(post.date_start).startOf('day')
  const endDate = dayjs(post.date_end || post.date_start).endOf('day')

  return !date.endOf('day').isBefore(startDate) && !date.startOf('day').isAfter(endDate)
}

function CalendarPage() {
  const [calendarDate, setCalendarDate] = useState(() => dayjs())
  const [selectedDate, setSelectedDate] = useState(() => dayjs())

  const monthStart = calendarDate.startOf('month').format('YYYY-MM-DD')
  const monthEnd = calendarDate.endOf('month').format('YYYY-MM-DD')

  const { data, isLoading, isFetching, error } = useGetPostListQuery({
    pagination: { page: 1, per_page: 100 },
    post_category_ids: EVENT_CATEGORY_ID,
    min_start_date: monthStart,
    max_start_date: monthEnd,
  })

  const posts = useMemo(() => {
    const source = data?.data || []

    return source
      .filter((post) => post.post_category_id === EVENT_CATEGORY_ID || post.category?.id === EVENT_CATEGORY_ID)
      .sort((a, b) => {
        const first = `${a.date_start || ''} ${a.time_start || ''}`
        const second = `${b.date_start || ''} ${b.time_start || ''}`

        return first.localeCompare(second)
      })
  }, [data?.data])

  const selectedDatePosts = useMemo(
    () => posts.filter((post) => isPostActiveOnDate(post, selectedDate)),
    [posts, selectedDate],
  )

  const getPostsForDate = (date: Dayjs) => posts.filter((post) => isPostActiveOnDate(post, date))

  const changeMonth = (amount: number) => {
    const nextDate = calendarDate.add(amount, 'month')
    setCalendarDate(nextDate)
    setSelectedDate(nextDate.startOf('month'))
  }

  const fullCellRender: CalendarProps<Dayjs>['fullCellRender'] = (current, info) => {
    if (info.type !== 'date') {
      return info.originNode
    }

    const hasEvents = getPostsForDate(current).length > 0
    const isSelected = current.isSame(selectedDate, 'day')
    const isToday = current.isSame(dayjs(), 'day')
    const isCurrentMonth = current.isSame(calendarDate, 'month')

    return (
      <div
        className={[
          'events-calendar-cell',
          hasEvents ? 'events-calendar-cell--has-events' : '',
          isSelected ? 'events-calendar-cell--selected' : '',
          isToday ? 'events-calendar-cell--today' : '',
          !isCurrentMonth ? 'events-calendar-cell--muted' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="events-calendar-cell__date">
          {current.date()}
        </div>
      </div>
    )
  }

  return (
    <section className="section events-calendar-page">
      <div className="container">
        <div className="title_page">
          <div>
            <Typography.Text className="events-calendar-eyebrow">
              мероприятия
            </Typography.Text>
            <Typography.Title level={1} className="events-calendar-title">
              Календарь
            </Typography.Title>
            <Typography.Paragraph className="events-calendar-description">
              События мотосообщества на выбранный месяц.
            </Typography.Paragraph>
          </div>
          <CalendarOutlined className="title_page__icon" />
        </div>

        <Row className="events-calendar-layout" gutter={[8, 8]} align="top">
          <Col xs={24} lg={8}>
            <Card className="events-calendar-card" size="small">
              <Calendar
                value={calendarDate}
                fullscreen
                onSelect={(date) => {
                  setCalendarDate(date)
                  setSelectedDate(date)
                }}
                onPanelChange={(date) => {
                  setCalendarDate(date)
                  setSelectedDate(date.startOf('month'))
                }}
                fullCellRender={fullCellRender}
                headerRender={({ value }) => (
                  <>
                    <Typography.Text className="events-calendar-day-card__label">
                      {value.format('MMMM YYYY')}
                    </Typography.Text>
                    <div className="events-calendar-header">
                      <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => changeMonth(-1)}
                      />
                      <Button
                        type="text"
                        onClick={() => {
                          const today = dayjs()
                          setCalendarDate(today)
                          setSelectedDate(today)
                        }}
                      >
                        Сегодня
                      </Button>
                      <Button
                        type="text"
                        icon={<RightOutlined />}
                        onClick={() => changeMonth(1)}
                      />
                    </div>
                  </>
                )}
              />

              {isFetching && (
                <div className="events-calendar-loading">
                  <Spin />
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="events-calendar-day-card" size="small">
              <Typography.Text className="events-calendar-day-card__label">
                выбранная дата
              </Typography.Text>
              <Typography.Title level={3} className="events-calendar-day-card__title">
                {selectedDate.format('D MMMM YYYY')}
              </Typography.Title>

              {error && (
                <Typography.Text type="danger">
                  Ошибка загрузки мероприятий
                </Typography.Text>
              )}

              {!error && isLoading && <Spin />}

              {!error && !isLoading && selectedDatePosts.length === 0 && (
                <Empty description="На этот день мероприятий нет" />
              )}

              {!error && !isLoading && selectedDatePosts.length > 0 && (
                <Row className="events-calendar-list" gutter={[12, 12]}>
                  {selectedDatePosts.map((post) => (
                    <Col key={post.id} xs={24} md={12} xl={8}>
                      <PostCard post={post} />
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default CalendarPage

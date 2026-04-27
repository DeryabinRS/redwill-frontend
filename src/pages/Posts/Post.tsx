import { Alert, Card, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, LinkOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '@config/constants'
import { useGetPostQuery } from '@features/post/postSlice'
import MapView from '@components/YandexMapV3/MapView'

const { Title, Text, Paragraph } = Typography

function formatTime(value?: string | null) {
  if (!value) return null

  const [hours, minutes] = value.split(':')
  if (!hours || !minutes) return value

  return dayjs().hour(Number(hours)).minute(Number(minutes)).format('HH:mm')
}

function Post() {
  const { post } = useParams<{ post: string }>()
  const shouldSkipQuery = !post

  const {
    data: postData,
    isLoading,
    isError,
  } = useGetPostQuery(post as string, {
    skip: shouldSkipQuery,
  })

  if (shouldSkipQuery) {
    return (
      <div className="container">
        <Alert
          type="error"
          showIcon
          message="Некорректный идентификатор поста"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (isError || !postData) {
    return (
      <div className="container" style={{ marginTop: 8 }}>
        <Alert
          type="error"
          showIcon
          message="Не удалось загрузить пост"
        />
      </div>
    )
  }

  const imageSrc = postData.image ? `${API_URL}${postData.image}` : null

  return (
    <div className="container">
      <Card style={{ marginTop: 8 }}>
        <Row gutter={[24, 24]}>
          {imageSrc && (
            <Col xs={24} md={10}>
              <img
                src={imageSrc}
                alt={postData.title}
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
              />
            </Col>
          )}

          <Col xs={24} md={imageSrc ? 14 : 24}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {postData.title}
              </Title>
              <Divider style={{ margin: '0' }} />
              <Space direction="vertical" size={8}>
                {(postData.date_start || postData.time_start) && (
                  <Space size={8}>
                    <CalendarOutlined />
                    <Text type="secondary">
                      {postData.date_start && dayjs(postData.date_start).format('DD.MM.YYYY')}
                      {postData.time_start && ` ${formatTime(postData.time_start)}`}
                      {postData.date_end && ` — ${dayjs(postData.date_end).format('DD.MM.YYYY')}`}
                      {postData.time_end && ` ${formatTime(postData.time_end)}`}
                    </Text>
                  </Space>
                )}

                {postData.location && (
                  <Space size={8}>
                    <EnvironmentOutlined />
                    <Text type="secondary">{postData.location}</Text>
                  </Space>
                )}

                {postData.address && (
                  <Space size={8}>
                    <EnvironmentOutlined />
                    <Text type="secondary">{postData.address}</Text>
                  </Space>
                )}

                {postData.profile && (
                  <Space size={8}>
                    <UserOutlined />
                    <Text type="secondary">
                      {postData.profile.first_name} {postData.profile.last_name}
                    </Text>
                  </Space>
                )}

                {postData.motoclubs && postData.motoclubs.length > 0 && (
                  <Space direction="vertical" size={8}>
                    <Text strong>Организаторы</Text>
                    <Space size={12} wrap>
                      {postData.motoclubs.map((motoclub) => (
                        <Link
                          key={motoclub.id}
                          to={`/motoclubs/${motoclub.id}`}
                          title={motoclub.name}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'inherit',
                          }}
                        >
                          {motoclub.logo ? (
                            <img
                              src={`${API_URL}${motoclub.logo}`}
                              alt={motoclub.name}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid #e2e8f0',
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontWeight: 600,
                              }}
                            >
                              {motoclub.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </Link>
                      ))}
                    </Space>
                  </Space>
                )}

                {postData.link && (
                  <Space size={8}>
                    <LinkOutlined />
                    <a href={postData.link} target="_blank" rel="noreferrer">
                      {postData.link}
                    </a>
                  </Space>
                )}
              </Space>

              {postData.content && (
                <Paragraph style={{ marginBottom: 0 }}>
                  {postData.content.replace(/<[^>]*>/g, '')}
                </Paragraph>
              )}

              {postData.location && <MapView location={postData.location} />}
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Post

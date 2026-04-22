import { Alert, Card, Col, Row, Skeleton, Space, Typography } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, LinkOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config/constants'
import { useGetPostQuery } from '../../features/post/postSlice'
import { useYmaps3 } from '../../hooks/useYmaps3'

const { Title, Text, Paragraph } = Typography

function formatTime(value?: string | null) {
  if (!value) return null

  const [hours, minutes] = value.split(':')
  if (!hours || !minutes) return value

  return dayjs().hour(Number(hours)).minute(Number(minutes)).format('HH:mm')
}

function parseLocationCoordinates(location?: string | null) {
  if (!location) return null

  const [latValue, lngValue] = location.split(',').map((part) => Number(part.trim()))
  if (Number.isNaN(latValue) || Number.isNaN(lngValue)) {
    return null
  }

  return { lat: latValue, lng: lngValue }
}

function PostLocationMap({ location }: { location: string }) {
  const { isReady, error, reactify } = useYmaps3()
  const coords = parseLocationCoordinates(location)
  const [zoom, setZoom] = useState(14)

  if (!coords) {
    return null
  }

  if (error) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Не удалось загрузить карту"
      />
    )
  }

  if (!isReady || !reactify) {
    return <Skeleton active paragraph={{ rows: 4 }} />
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
  } = reactify.module(window.ymaps3)

  return (
    <div
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        height: '400px',
        width: '100%',
        position: 'relative',
      }}
    >
      <YMap
        location={{
          center: [coords.lng, coords.lat],
          zoom,
        }}
      >
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapMarker
          coordinates={reactify.useDefault([coords.lng, coords.lat])}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              transform: 'translate(-50%, -100%)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" fill="#dc2626" stroke="white" strokeWidth="2" />
              <circle cx="16" cy="12" r="4" fill="white" />
            </svg>
          </div>
        </YMapMarker>
      </YMap>

      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((currentZoom) => Math.min(currentZoom + 1, 20))}
          style={{
            width: 28,
            height: 28,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            color: '#64748b',
          }}
          aria-label="Увеличить масштаб"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((currentZoom) => Math.max(currentZoom - 1, 2))}
          style={{
            width: 28,
            height: 28,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            color: '#64748b',
          }}
          aria-label="Уменьшить масштаб"
        >
          -
        </button>
      </div>
    </div>
  )
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
      <div className="container">
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (isError || !postData) {
    return (
      <div className="container">
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
              <Title level={2} style={{ margin: 0 }}>
                {postData.title}
              </Title>

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

              {postData.location && <PostLocationMap location={postData.location} />}
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Post

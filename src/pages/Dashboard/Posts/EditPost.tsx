import { App as AntdApp, Button, Card, Col, DatePicker, Divider, Form, Input, Row, Select, Skeleton, Space, Switch, TimePicker, Typography } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGetPostQuery, useUpdatePostMutation, useUploadPostImageMutation } from '../../../features/post/postSlice'
import { API_URL } from '@config/constants'
import ImageCropper from '@components/ImageCropper'
import MapPicker from '@components/YandexMapV3/MapPicker'
import { base64ToFile, moderationStatusOptions, sanitizeInput } from '@utils/form'
import { ArrowLeftOutlined } from '@ant-design/icons'

type FormValues = {
  title: string
  content?: string
  link?: string
  location?: string
  address?: string
  publication_status: boolean
  moderation_status: 0 | 1 | 2 | 3
  date_start: dayjs.Dayjs
  date_end?: dayjs.Dayjs
  time_start?: dayjs.Dayjs
  time_end?: dayjs.Dayjs
}

function UpdatePost() {
  const { message } = AntdApp.useApp()
  const { post } = useParams<{ post: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm<FormValues>()
  const [imageForm] = Form.useForm()
  const [previewUrl, setPreviewUrl] = useState('')
  const [pendingImage, setPendingImage] = useState('')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [uploadPostImage, { isLoading: isUploadingImage }] = useUploadPostImageMutation()

  const cropperValue = pendingImage || previewUrl
  const hasNewImageToUpload = Boolean(pendingImage && pendingImage.startsWith('data:image'))

  const {
    data: postData,
    isLoading,
    isError,
  } = useGetPostQuery(post as string, {
    skip: !post,
  })

  useEffect(() => {
    if (!postData) return

    form.setFieldsValue({
      title: postData.title,
      content: postData.content || '',
      link: postData.link || '',
      location: postData.location || '',
      address: postData.address || '',
      publication_status: Boolean(postData.publication_status),
      moderation_status: postData.moderation_status ?? 0,
      date_start: dayjs(postData.date_start),
      date_end: postData.date_end ? dayjs(postData.date_end) : undefined,
      time_start: postData.time_start
        ? dayjs(`2000-01-01 ${postData.time_start}`, 'YYYY-MM-DD HH:mm')
        : undefined,
      time_end: postData.time_end
        ? dayjs(`2000-01-01 ${postData.time_end}`, 'YYYY-MM-DD HH:mm')
        : undefined,
    })
    if (postData.image) {
      setPreviewUrl(`${API_URL}${postData.image}`)
      setPendingImage('')
    }
  }, [form, postData])

  const onImageSubmit = async () => {
    if (!post) return
    if (!pendingImage || !pendingImage.startsWith('data:image')) {
      message.warning('Выберите новое изображение')
      return
    }
    try {
      const file = await base64ToFile(pendingImage, `post_${Date.now()}.jpg`)
      if (!file) {
        message.error('Не удалось подготовить файл')
        return
      }
      const fd = new FormData()
      fd.append('image', file)
      const imageResult = await uploadPostImage({ post, payload: fd }).unwrap()
      message.success('Изображение обновлено')
      if (imageResult.image) {
        setPreviewUrl(`${API_URL}${imageResult.image}`)
      }
      setPendingImage('')
    } catch {
      message.error('Не удалось обновить изображение')
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!post) return

    try {
      const formData = new FormData()
      formData.append('title', sanitizeInput(values.title))
      formData.append('post_category_id', String(postData?.post_category_id || 2))
      if (values.content) formData.append('content', sanitizeInput(values.content))
      if (values.link) formData.append('link', sanitizeInput(values.link))
      if (values.location) formData.append('location', sanitizeInput(values.location))
      if (values.address) formData.append('address', sanitizeInput(values.address))
      formData.append('publication_status', values.publication_status ? '1' : '0')
      formData.append('moderation_status', String(values.moderation_status))
      formData.append('date_start', values.date_start.format('YYYY-MM-DD'))
      if (values.date_end) formData.append('date_end', values.date_end.format('YYYY-MM-DD'))
      if (values.time_start) formData.append('time_start', values.time_start.format('HH:mm'))
      if (values.time_end) formData.append('time_end', values.time_end.format('HH:mm'))

      await updatePost({ post, payload: formData }).unwrap()
      message.success('Пост обновлен')
      navigate('/dashboard/posts')
    } catch {
      message.error('Не удалось обновить пост')
    }
  }

  if (!post) {
    return <Typography.Text type="danger">Некорректный ID поста</Typography.Text>
  }

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  if (isError || !postData) {
    return <Typography.Text type="danger">Пост не найден</Typography.Text>
  }

  const renderImageForm = () => (
    <Form form={imageForm} layout="vertical" onFinish={onImageSubmit}>
        <Form.Item label="Обложка (JPG, PNG)">
          <ImageCropper
            value={cropperValue}
            onChange={(v) => {
              if (v.startsWith('data:image')) setPendingImage(v)
              else setPendingImage('')
            }}
            orientation={orientation}
            onOrientationChange={setOrientation}
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isUploadingImage}
          disabled={!hasNewImageToUpload || isUploadingImage}
        >
          Обновить изображение
        </Button>
    </Form>
  );
  
  return (
    <div>
      <Link to="/dashboard/posts">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          К списку событий
        </Button>
      </Link>
      <Typography.Title level={4}>Редактировать пост</Typography.Title>

      <Card size="small">
        <Row gutter={16}>
          <Col xs={24} md={8} lg={8} xl={6}>
            {renderImageForm()}
          </Col>
          <Col xs={24} md={16} lg={16} xl={18}>
            <Form form={form} layout="vertical" onFinish={onSubmit}>
              <Form.Item
                label="Заголовок"
                name="title"
                rules={[{ required: true, message: 'Введите заголовок' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Описание" name="content">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item label="Ссылка" name="link">
                <Input placeholder="https://example.com" />
              </Form.Item>

              <Space size="large" style={{ width: '100%' }}>
                <Form.Item name="publication_status" label="Публикация" valuePropName="checked">
                  <Switch checkedChildren="Опубликован" unCheckedChildren="Черновик" />
                </Form.Item>
                <Form.Item name="moderation_status" label="Модерация">
                  <Select
                    style={{ minWidth: 220 }}
                    options={moderationStatusOptions}
                  />
                </Form.Item>
              </Space>

              <MapPicker
                initialLocation={postData.location || undefined}
                onChangeLocation={(loc: string) => {
                  form.setFieldValue('location', loc)
                }}
                onChangeAddress={(addr: string) => {
                  form.setFieldValue('address', addr)
                }}
              />

              <Form.Item name="location" label="Координаты" style={{ marginTop: 8, marginBottom: 8 }}>
                <Input readOnly placeholder="Кликните по карте, чтобы получить координаты..." />
              </Form.Item>

              <Form.Item name="address" label="Адрес">
                <Input readOnly placeholder="Кликните по карте, чтобы определить адрес..." />
              </Form.Item>

              <Space.Compact style={{ display: 'flex'}}>
                <Form.Item
                  name="date_start"
                  label="Дата начала"
                  rules={[{ required: true, message: 'Выберите дату' }]}
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item name="time_start" label="Время начала">
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Space.Compact>

              <Space.Compact>
                <Form.Item name="date_end" label="Дата окончания">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="time_end" label="Время окончания">
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Space.Compact>

              <Divider style={{ margin: '0' }} />
              <Space style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit" loading={isUpdating}>
                  Сохранить пост
                </Button>
                <Button onClick={() => navigate('/dashboard/posts')}>Отмена</Button>
              </Space>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default UpdatePost

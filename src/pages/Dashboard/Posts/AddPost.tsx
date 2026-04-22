import { App as AntdApp, Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Switch, TimePicker, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatePostMutation } from '../../../features/post/postSlice'
import ImageCropper from '../../../components/ImageCropper'
import YandexMapV3Picker from '../../../components/YandexMapV3Picker'
import { base64ToFile, sanitizeInput } from '../../../utils/form'

type FormValues = {
  title: string
  content?: string
  link?: string
  location?: string
  address?: string
  publication_status: boolean
  moderation_status: 0 | 1 | 2
  date_start: dayjs.Dayjs
  date_end?: dayjs.Dayjs
  time_start?: dayjs.Dayjs
  time_end?: dayjs.Dayjs
}

function AddPost() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<FormValues>()
  const [image, setImage] = useState('')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [createPost, { isLoading }] = useCreatePostMutation()

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('title', sanitizeInput(values.title))
      formData.append('post_category_id', '2')
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
      if (image && image.startsWith('data:image')) {
        const file = await base64ToFile(image, `post_${Date.now()}.jpg`)
        if (file) formData.append('image', file)
      }

      await createPost(formData).unwrap()
      message.success('Пост создан')
      navigate('/dashboard/posts')
    } catch {
      message.error('Не удалось создать пост')
    }
  }

  return (
    <div>
      <Typography.Title level={2}>Создать пост</Typography.Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{
            date_start: dayjs(),
            publication_status: true,
            moderation_status: 0,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Изображение (JPG, PNG)"
                required
              >
                <ImageCropper
                  value={image}
                  onChange={setImage}
                  orientation={orientation}
                  onOrientationChange={setOrientation}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
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
                    options={[
                      { value: 0, label: 'На модерации' },
                      { value: 1, label: 'Одобрено' },
                      { value: 2, label: 'Отменено' },
                    ]}
                  />
                </Form.Item>
              </Space>

              <YandexMapV3Picker
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

              <Space size="large">
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
              </Space>

              <Space size="large">
                <Form.Item name="date_end" label="Дата окончания">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="time_end" label="Время окончания">
                  <TimePicker format="HH:mm" />
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Сохранить
            </Button>
            <Button onClick={() => navigate('/dashboard/posts')}>
              Отмена
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default AddPost

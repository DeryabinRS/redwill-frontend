import { useState } from 'react'
import { App as AntdApp, Button, Card, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import ImageCropper from '../../components/ImageCropper/ImageCropper'
import MapPicker from '../../components/YandexMapV3/MapPicker'
import OptionalLabel from '../../components/OptionalLabel'
import LinksInput from '../../components/LinksInput/LinksInput'
import { useCreateMotoPostMutation } from '../../features/motoPost/motoPostSlice'
import { base64ToFile, sanitizeInput, validateLinksMaxLength } from '../../utils/form'

type FormValues = {
  name: string
  desc?: string
  logo?: File
  address: string
  location: string
  phone?: string
  links?: string[]
}

function AddMotoPost() {
  const [form] = Form.useForm<FormValues>()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [logo, setLogo] = useState('')
  const [createMotoPost, { isLoading }] = useCreateMotoPostMutation()
  const backPath = pathname.startsWith('/dashboard') ? '/dashboard/moto-posts' : '/profile'

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'phone', values.phone)
      ;(values.links ?? []).forEach((link) => {
        const trimmed = link.trim()
        if (trimmed) formData.append('links[]', sanitizeInput(trimmed))
      })
      formData.append('address', sanitizeInput(values.address))
      formData.append('location', sanitizeInput(values.location))

      if (logo && logo.startsWith('data:image')) {
        const file = await base64ToFile(logo, `moto_post_${Date.now()}.webp`)
        if (file) formData.append('logo', file)
      }

      await createMotoPost(formData).unwrap()
      message.success('Мото-пост создан и отправлен на модерацию')
      navigate(backPath)
    } catch {
      message.error('Не удалось создать мото-пост')
    }
  }

  return (
    <div className="container">
      <Typography.Title level={2}>Добавить мото-пост</Typography.Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="logo"
                label="Логотип (JPG, PNG)"
                rules={[{ required: true, message: 'Выберите изображение' }]}
              >
                <ImageCropper
                  value={logo}
                  onChange={setLogo}
                  aspectRatio={1}
                  outputSize={{ width: 500, height: 500 }}
                  showOrientationSwitch={false}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item
                name="name"
                label="Название"
                rules={[
                  { required: true, message: 'Введите название мото-поста' },
                  { max: 255, message: 'Максимум 255 символов' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Input placeholder="Название мото-поста" />
              </Form.Item>

              <Form.Item
                name="desc"
                label={<OptionalLabel text="Описание" />}
                rules={[
                  { max: 500, message: 'Максимум 500 символов' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  maxLength={500}
                  showCount={{
                    formatter: ({ count, maxLength }) => `${(maxLength || 500) - count} осталось`,
                  }}
                  placeholder="Краткое описание мото-поста"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label={<OptionalLabel text="Телефон" />}
                    rules={[{ pattern: noScriptPattern, message: 'Недопустимые символы' }]}
                  >
                    <Input placeholder="+7..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="links"
                label={<OptionalLabel text="Ссылки" />}
                rules={[{ validator: validateLinksMaxLength }]}
              >
                <LinksInput />
              </Form.Item>

              <div>Чтобы получить координаты и название места, введите адрес или название заведения в поле поиска</div>
              <MapPicker
                onChangeLocation={(loc: string) => {
                  form.setFieldValue('location', loc)
                }}
                onChangeAddress={(addr: string) => {
                  form.setFieldValue('address', addr)
                }}
              />

              <Form.Item
                name="location"
                label="Координаты"
                style={{ marginTop: 8, marginBottom: 8 }}
                rules={[{ required: true, message: 'Выберите место через поиск' }]}
              >
                <Input readOnly placeholder="Введите место в поиске, чтобы получить координаты..." />
              </Form.Item>

              <Form.Item
                name="address"
                label="Адрес"
                rules={[
                  { required: true, message: 'Выберите адрес через поиск' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Input placeholder="Адрес мото-поста" />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Сохранить
            </Button>
            <Button onClick={() => navigate(backPath)}>
              Отмена
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default AddMotoPost

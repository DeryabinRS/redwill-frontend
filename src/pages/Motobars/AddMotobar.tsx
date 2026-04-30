import { useState } from 'react'
import { App as AntdApp, Button, Card, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import ImageCropper from '../../components/ImageCropper'
import MapPicker from '../../components/YandexMapV3/MapPicker'
import { useCreateMotobarMutation } from '../../features/motobar/motobarSlice'
import { base64ToFile, sanitizeInput } from '../../utils/form'

type FormValues = {
  name: string
  desc?: string
  website?: string
  logo?: File
  address: string
  location: string
  phone?: string
}

function AddMotobar() {
  const [form] = Form.useForm<FormValues>()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [logo, setLogo] = useState('')
  const [createMotobar, { isLoading }] = useCreateMotobarMutation()
  const backPath = pathname.startsWith('/dashboard') ? '/dashboard/motobars' : '/motobars'

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'website', values.website)
      appendString(formData, 'phone', values.phone)
      formData.append('address', sanitizeInput(values.address))
      formData.append('location', sanitizeInput(values.location))

      if (logo && logo.startsWith('data:image')) {
        const file = await base64ToFile(logo, `motobar_${Date.now()}.jpg`)
        if (file) formData.append('logo', file)
      }

      await createMotobar(formData).unwrap()
      message.success('Мото-бар создан и отправлен на модерацию')
      navigate(backPath)
    } catch {
      message.error('Не удалось создать мото-бар')
    }
  }

  return (
    <div className="container">
      <Typography.Title level={2}>Добавить мото-бар</Typography.Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="logo"
                label="Логотип (JPG, PNG)"
                rules={[
                  { required: true, message: 'Выберите изображение' },
                ]}
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
                  { required: true, message: 'Введите название мото-бара' },
                  { max: 255, message: 'Максимум 255 символов' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Input placeholder="Название мото-бара" />
              </Form.Item>

              <Form.Item
                name="desc"
                label="Описание"
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
                  placeholder="Краткое описание мото-бара"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="website"
                    label="Сайт"
                    rules={[
                      { type: 'url', message: 'Введите корректный URL' },
                      { pattern: noScriptPattern, message: 'Недопустимые символы' },
                    ]}
                  >
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Телефон"
                    rules={[{ pattern: noScriptPattern, message: 'Недопустимые символы' }]}
                  >
                    <Input placeholder="+7..." />
                  </Form.Item>
                </Col>
              </Row>

              <div>Чтобы получить координаты и название места, введите адрес или название заведения в поле поиска</div>
              <MapPicker
                // onlySearchInput={true}
                // addressMode="full"
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
                <Input placeholder="Адрес мото-бара" />
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

export default AddMotobar

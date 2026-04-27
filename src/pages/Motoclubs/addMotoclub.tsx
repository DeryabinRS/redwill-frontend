import { useState } from 'react'
import { App as AntdApp, Button, Card, Col, DatePicker, Form, Input, Row, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import ImageCropper from '../../components/ImageCropper'
import MapPicker from '../../components/YandexMapV3/MapPicker'
import { useCreateMotoclubMutation } from '../../features/motoclub/motoclubSlice'
import { base64ToFile, sanitizeInput } from '../../utils/form'

type FormValues = {
  name: string
  desc?: string
  birthday?: string
  logo?: File
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  location?: string
}

function AddMotoclub() {
  const [form] = Form.useForm<FormValues>()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [logo, setLogo] = useState('')
  const [createMotoclub, { isLoading }] = useCreateMotoclubMutation()
  const backPath = pathname.startsWith('/dashboard') ? '/dashboard/motoclubs' : '/motoclubs'

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'birthday', values.birthday)
      appendString(formData, 'website', values.website)
      appendString(formData, 'phone', values.phone)
      appendString(formData, 'email', values.email)
      appendString(formData, 'address', values.address)
      appendString(formData, 'location', values.location)

      if (logo && logo.startsWith('data:image')) {
        const file = await base64ToFile(logo, `motoclub_${Date.now()}.jpg`)
        if (file) formData.append('logo', file)
      }

      await createMotoclub(formData).unwrap()
      message.success('Мотоклуб создан и отправлен на модерацию')
      navigate(backPath)
    } catch {
      message.error('Не удалось создать мотоклуб')
    }
  }

  return (
    <section className="section" style={{ padding: '30px 0' }}>
      <div className="container">
        <Typography.Title level={2}>Добавить мотоклуб</Typography.Title>
        <Card>
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Логотип (JPG, PNG)">
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
                    { required: true, message: 'Введите название мотоклуба' },
                    { max: 255, message: 'Максимум 255 символов' },
                    { pattern: noScriptPattern, message: 'Недопустимые символы' },
                  ]}
                >
                  <Input placeholder="Название мотоклуба" />
                </Form.Item>

                <Form.Item
                  name="desc"
                  label="Описание"
                  rules={[{ pattern: noScriptPattern, message: 'Недопустимые символы' }]}
                >
                  <Input.TextArea rows={4} placeholder="Краткое описание мотоклуба" />
                </Form.Item>

                <Form.Item name="birthday" label="День рождения клуба">
                  <DatePicker />
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
                      name="email"
                      label="Email"
                      rules={[
                        { type: 'email', message: 'Введите корректный email' },
                        { pattern: noScriptPattern, message: 'Недопустимые символы' },
                      ]}
                    >
                      <Input placeholder="club@example.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
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

                <MapPicker
                  addressMode="locality"
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

                <Form.Item
                  name="address"
                  label="Адрес"
                  rules={[{ pattern: noScriptPattern, message: 'Недопустимые символы' }]}
                >
                  <Input placeholder="Адрес мотоклуба" />
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
    </section>
  )
}

export default AddMotoclub

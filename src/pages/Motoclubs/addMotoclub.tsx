import { useState } from 'react'
import { App as AntdApp, Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import ImageCropper from '../../components/ImageCropper/ImageCropper'
import MapPicker from '../../components/YandexMapV3/MapPicker'
import {
  useCreateMotoclubMutation,
  useGetMotoclubListQuery,
  type Motoclub,
} from '../../features/motoclub/motoclubSlice'
import { base64ToFile, sanitizeInput } from '../../utils/form'
import dayjs from 'dayjs'

type FormValues = {
  name: string
  parent_id?: number
  desc?: string
  birthday?: string
  logo?: File
  website?: string
  phone?: string
  email?: string
  address: string
  location: string
}

function AddMotoclub() {
  const [form] = Form.useForm<FormValues>()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [logo, setLogo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [createMotoclub, { isLoading }] = useCreateMotoclubMutation()
  const { data: motoclubsData, isLoading: isLoadingMotoclubs } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const parentOptions = (motoclubsData?.data || []).map((motoclub: Motoclub) => ({
    value: motoclub.id,
    label: motoclub.address ? `${motoclub.name} (${motoclub.address})` : motoclub.name,
  }))
  const backPath = pathname.startsWith('/dashboard') ? '/dashboard/motoclubs' : '/profile'

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const handleAddressSearch = () => {
    const address = form.getFieldValue('address')?.trim() || ''
    setSearchQuery((current) => current.trim() === address ? `${address} ` : address)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      if (values.parent_id) formData.append('parent_id', String(values.parent_id))
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'birthday', values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : undefined)
      appendString(formData, 'website', values.website)
      appendString(formData, 'phone', values.phone)
      appendString(formData, 'email', values.email)
      formData.append('address', sanitizeInput(values.address))
      formData.append('location', sanitizeInput(values.location))

      if (logo && logo.startsWith('data:image')) {
        const file = await base64ToFile(logo, `motoclub_${Date.now()}.webp`)
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
    <div className="container">
      <Typography.Title level={2}>Добавить мотоклуб</Typography.Title>
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
                  { required: true, message: 'Введите название мотоклуба' },
                  { max: 255, message: 'Максимум 255 символов' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Input placeholder="Название мотоклуба" />
              </Form.Item>

              <Form.Item name="parent_id" label="Родительский мотоклуб (необязательно)">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={isLoadingMotoclubs}
                  options={parentOptions}
                  placeholder="Не выбран"
                />
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
                  placeholder="Краткое описание мотоклуба"
                />
              </Form.Item>

              <Form.Item name="birthday" label="День рождения клуба">
                <DatePicker />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="website"
                    label="Ссылка"
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
              <Form.Item
                name="address"
                label="Город"
                rules={[
                  { required: true, message: 'Выберите адрес через поиск' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Город мотоклуба"
                  onPressEnter={(event) => {
                    event.preventDefault()
                    handleAddressSearch()
                  }}
                />
                <Button
                  type="primary"
                  htmlType="button"
                  onClick={handleAddressSearch}
                  // loading={isSearching}
                >
                  Найти
                </Button>
                </Space.Compact>
              </Form.Item>

              <MapPicker
                searchValue={searchQuery}
                showSearchInput={false}
                onChangeLocation={(loc: string) => {
                  form.setFieldValue('location', loc)
                }}
              />
              
              <Form.Item
                name="location"
                label="Координаты"
                style={{ marginTop: 8, marginBottom: 8 }}
                rules={[{ required: true, message: 'Выберите место через поиск' }]}
              >
                <Input readOnly placeholder="Координаты будут получены автоматически" />
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

export default AddMotoclub

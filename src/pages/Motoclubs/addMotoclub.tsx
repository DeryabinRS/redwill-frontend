import { useEffect, useState } from 'react'
import { App as AntdApp, Button, Card, Checkbox, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import ImageCropper from '../../components/ImageCropper/ImageCropper'
import MapPicker from '../../components/YandexMapV3/MapPicker'
import OptionalLabel from '../../components/OptionalLabel'
import LinksInput from '../../components/LinksInput/LinksInput'
import {
  useCreateMotoclubMutation,
  useGetJoinedMotoclubsQuery,
  useGetMotoclubListQuery,
  type Motoclub,
} from '../../features/motoclub/motoclubSlice'
import { useGetMotoPostListQuery } from '../../features/motoPost/motoPostSlice'
import { useGetServiceStationListQuery } from '../../features/serviceStation/serviceStationSlice'
import { useGetMotobarListQuery } from '../../features/motobar/motobarSlice'
import { useGetUserInfoQuery } from '../../features/user/userSlice'
import { base64ToFile, sanitizeInput, validateLinksMaxLength } from '../../utils/form'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { BikePostHelper, StoHelper, BikeBarHelper } from './helpers'

const MAX_CREATED_MOTOCLUBS = 1

type FormValues = {
  name: string
  parent_id?: number
  desc?: string
  birthday?: string
  logo?: File
  links?: string[]
  phone?: string
  email?: string
  has_moto_post?: boolean
  has_service_station?: boolean
  has_motobar?: boolean
  moto_post_id?: number
  service_station_id?: number
  motobar_id?: number
  address: string
  location: string
}

function AddMotoclub() {
  const [form] = Form.useForm<FormValues>()
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [logo, setLogo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [createMotoclub, { isLoading }] = useCreateMotoclubMutation()
  const { data: joinedData } = useGetJoinedMotoclubsQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: currentUser } = useGetUserInfoQuery()
  const { data: motoclubsData, isLoading: isLoadingMotoclubs } = useGetMotoclubListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: motoPostsData, isLoading: isLoadingMotoPosts } = useGetMotoPostListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: serviceStationsData, isLoading: isLoadingServiceStations } = useGetServiceStationListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const { data: motobarsData, isLoading: isLoadingMotobars } = useGetMotobarListQuery({
    pagination: { page: 1, per_page: 100 },
  })
  const motoPostOptions = (motoPostsData?.data || []).map((m) => ({ value: m.id, label: m.name }))
  const serviceStationOptions = (serviceStationsData?.data || []).map((s) => ({ value: s.id, label: s.name }))
  const motobarOptions = (motobarsData?.data || []).map((b) => ({ value: b.id, label: b.name }))
  const hasMotoPost = Form.useWatch('has_moto_post', form)
  const hasServiceStation = Form.useWatch('has_service_station', form)
  const hasMotobar = Form.useWatch('has_motobar', form)

  useEffect(() => {
    if (!hasMotoPost) form.setFieldValue('moto_post_id', undefined)
  }, [hasMotoPost, form])

  useEffect(() => {
    if (!hasServiceStation) form.setFieldValue('service_station_id', undefined)
  }, [hasServiceStation, form])

  useEffect(() => {
    if (!hasMotobar) form.setFieldValue('motobar_id', undefined)
  }, [hasMotobar, form])
  const parentOptions = (motoclubsData?.data || []).map((motoclub: Motoclub) => ({
    value: motoclub.id,
    label: motoclub.address ? `${motoclub.name} (${motoclub.address})` : motoclub.name,
  }))
  const backPath = pathname.startsWith('/dashboard') ? '/dashboard/motoclubs' : '/profile'
  const ownedCount = (joinedData?.data ?? []).filter((m) => m.user_id === currentUser?.id).length
  const canCreate = ownedCount < MAX_CREATED_MOTOCLUBS

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const handleAddressSearch = () => {
    const address = form.getFieldValue('address')?.trim() || ''
    setSearchQuery((current) => current.trim() === address ? `${address} ` : address)
  }

  const onSubmit = async (values: FormValues) => {
    if (!canCreate) {
      message.warning(t('profile.motoclubCreateLimit'))
      return
    }
    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      if (values.parent_id) formData.append('parent_id', String(values.parent_id))
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'birthday', values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : undefined)
      ;(values.links ?? []).forEach((link) => {
        const trimmed = link.trim()
        if (trimmed) formData.append('links[]', sanitizeInput(trimmed))
      })
      appendString(formData, 'phone', values.phone)
      appendString(formData, 'email', values.email)
      formData.append('address', sanitizeInput(values.address))
      formData.append('location', sanitizeInput(values.location))
      formData.append('has_moto_post', values.has_moto_post ? '1' : '0')
      formData.append('has_service_station', values.has_service_station ? '1' : '0')
      formData.append('has_motobar', values.has_motobar ? '1' : '0')
      formData.append('moto_post_id', values.moto_post_id ? String(values.moto_post_id) : '')
      formData.append('service_station_id', values.service_station_id ? String(values.service_station_id) : '')
      formData.append('motobar_id', values.motobar_id ? String(values.motobar_id) : '')

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
      {!canCreate ? (
        <Typography.Paragraph type="warning">
          {t('profile.motoclubCreateLimit')}
        </Typography.Paragraph>
      ) : null}
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

              <Form.Item name="parent_id" label={<OptionalLabel text="Родительский мотоклуб" />}>
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
                  placeholder="Краткое описание мотоклуба"
                />
              </Form.Item>

              <Form.Item name="birthday" label={<OptionalLabel text="День рождения клуба" />}>
                <DatePicker />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label={<OptionalLabel text="Email" />}
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
                    label={<OptionalLabel text="Телефон" />}
                    rules={[{ pattern: noScriptPattern, message: 'Недопустимые символы' }]}
                  >
                    <Input placeholder="+7..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="links" label={<OptionalLabel text="Ссылки" />} rules={[{ validator: validateLinksMaxLength }]}>
                <LinksInput />
              </Form.Item>

              <Row gutter={16} style={{ marginBottom: 8 }}>
                <Col xs={24} md={8}>
                  <Form.Item name="has_moto_post" valuePropName="checked" style={{ marginBottom: 8 }}>
                    <Checkbox>Наличие байк-поста</Checkbox>
                  </Form.Item>
                  {hasMotoPost && (
                    <>
                      <BikePostHelper />
                      <Form.Item name="moto_post_id" label={<OptionalLabel text="Байк-пост" />}>
                        <Select showSearch optionFilterProp="label" allowClear placeholder="Выберите байк-пост" loading={isLoadingMotoPosts} options={motoPostOptions} />
                      </Form.Item>
                    </>
                  )}
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="has_service_station" valuePropName="checked" style={{ marginBottom: 8 }}>
                    <Checkbox>Наличие СТО</Checkbox>
                  </Form.Item>
                  {hasServiceStation && (
                    <>
                      <StoHelper />
                      <Form.Item name="service_station_id" label={<OptionalLabel text="СТО" />}>
                        <Select showSearch optionFilterProp="label" allowClear placeholder="Выберите СТО" loading={isLoadingServiceStations} options={serviceStationOptions} />
                      </Form.Item>
                    </>
                  )}
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="has_motobar" valuePropName="checked" style={{ marginBottom: 8 }}>
                    <Checkbox>Наличие мото-бара</Checkbox>
                  </Form.Item>
                  {hasMotobar && (
                    <>
                      <BikeBarHelper />
                      <Form.Item name="motobar_id" label={<OptionalLabel text="Мото-бар" />}>
                        <Select showSearch optionFilterProp="label" allowClear placeholder="Выберите мото-бар" loading={isLoadingMotobars} options={motobarOptions} />
                      </Form.Item>
                    </>
                  )}
                </Col>
              </Row>

              <Form.Item label="Город" required>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item
                    name="address"
                    noStyle
                    rules={[
                      { required: true, message: 'Выберите адрес через поиск' },
                      { pattern: noScriptPattern, message: 'Недопустимые символы' },
                    ]}
                  >
                    <Input
                      placeholder="Город мотоклуба"
                      onPressEnter={(event) => {
                        event.preventDefault()
                        handleAddressSearch()
                      }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={handleAddressSearch}
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
                style={{ marginTop: 8, marginBottom: 8, display: 'none' }}
                rules={[{ required: true, message: 'Выберите место через поиск' }]}
              >
                <Input readOnly placeholder="Координаты будут получены автоматически" />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading} disabled={!canCreate}>
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

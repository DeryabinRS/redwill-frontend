import { App as AntdApp, Button, Card, Col, DatePicker, Form, Input, Row, Select, Skeleton, Space, Switch, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import ImageCropper from '@components/ImageCropper/ImageCropper'
import MapPicker from '@components/YandexMapV3/MapPicker'
import { API_URL } from '@config/constants'
import { base64ToFile, logoDataUrlToFileName, moderationStatusOptions, sanitizeInput } from '@utils/form'
import { useGetUserInfoQuery } from '@features/user/userSlice'
import {
  useGetDashboardMotoclubListQuery,
  useGetDashboardMotoclubQuery,
  useGetMotoclubListQuery,
  useGetUserMotoclubQuery,
  useUpdateMotoclubMutation,
  useUploadMotoclubLogoMutation,
  type Motoclub,
} from '@features/motoclub/motoclubSlice'

type FormValues = {
  name: string
  parent_id?: number | null
  desc?: string
  birthday?: dayjs.Dayjs
  website?: string
  social_link?: string
  phone?: string
  email?: string
  address?: string
  location?: string
  publication_status?: boolean
  moderation_status?: number
}

function EditMotoclub() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { motoclub } = useParams<{ motoclub: string }>()
  const [form] = Form.useForm<FormValues>()
  const [previewLogo, setPreviewLogo] = useState('')
  const [pendingLogo, setPendingLogo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [updateMotoclub, { isLoading: isUpdating }] = useUpdateMotoclubMutation()
  const [uploadMotoclubLogo, { isLoading: isUploadingLogo }] = useUploadMotoclubLogoMutation()
  const { data: userInfo } = useGetUserInfoQuery()

  const isDashboard = pathname.startsWith('/dashboard')
  const isStaff = Boolean(userInfo?.roles.includes('admin') || userInfo?.roles.includes('editor'))
  const showModerationFields = isStaff
  const backPath = isDashboard ? '/dashboard/motoclubs' : '/profile'
  const backLabel = isDashboard ? 'К списку мотоклубов' : 'К профилю'

  const cropperValue = pendingLogo || previewLogo
  const hasNewLogoToUpload = Boolean(pendingLogo && pendingLogo.startsWith('data:image'))

  const dashboardQuery = useGetDashboardMotoclubQuery(motoclub as string, {
    skip: !motoclub || !isDashboard,
  })
  const userQuery = useGetUserMotoclubQuery(motoclub as string, {
    skip: !motoclub || isDashboard,
  })

  const motoclubData = isDashboard ? dashboardQuery.data : userQuery.data
  const isLoading = isDashboard ? dashboardQuery.isLoading : userQuery.isLoading
  const isError = isDashboard ? dashboardQuery.isError : userQuery.isError

  const dashboardListQuery = useGetDashboardMotoclubListQuery(
    { pagination: { page: 1, per_page: 100 } },
    { skip: !isDashboard },
  )
  const publicListQuery = useGetMotoclubListQuery(
    { pagination: { page: 1, per_page: 100 } },
    { skip: isDashboard },
  )

  const motoclubsData = isDashboard ? dashboardListQuery.data : publicListQuery.data
  const isLoadingMotoclubs = isDashboard ? dashboardListQuery.isLoading : publicListQuery.isLoading

  const parentOptions = (motoclubsData?.data || [])
    .filter((item: Motoclub) => String(item.id) !== String(motoclub))
    .map((item: Motoclub) => ({
      value: item.id,
      label: item.address ? `${item.name} (${item.address})` : item.name,
    }))

  useEffect(() => {
    if (!motoclubData) return

    form.setFieldsValue({
      name: motoclubData.name,
      parent_id: motoclubData.parent_id ?? null,
      desc: motoclubData.desc || '',
      birthday: motoclubData.birthday ? dayjs(motoclubData.birthday) : undefined,
      website: motoclubData.website || '',
      social_link: motoclubData.social_link || '',
      phone: motoclubData.phone || '',
      email: motoclubData.email || '',
      address: motoclubData.address || '',
      location: motoclubData.location || '',
      ...(showModerationFields
        ? {
            publication_status: Boolean(motoclubData.publication_status),
            moderation_status: motoclubData.moderation_status ?? 0,
          }
        : {}),
    })

    if (motoclubData.logo) {
      setPreviewLogo(`${API_URL}${motoclubData.logo}`)
      setPendingLogo('')
    } else {
      setPreviewLogo('')
      setPendingLogo('')
    }
  }, [form, motoclubData, showModerationFields])

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const handleAddressSearch = () => {
    const address = form.getFieldValue('address')?.trim() || ''
    setSearchQuery((current) => (current.trim() === address ? `${address} ` : address))
  }

  const onLogoSubmit = async () => {
    if (!motoclub) return
    if (!hasNewLogoToUpload) {
      message.warning('Выберите новый логотип')
      return
    }

    try {
      const file = await base64ToFile(pendingLogo, logoDataUrlToFileName('motoclub'))
      if (!file) {
        message.error('Не удалось подготовить файл')
        return
      }

      const formData = new FormData()
      formData.append('logo', file)
      const result = await uploadMotoclubLogo({ motoclub, payload: formData }).unwrap()

      message.success('Логотип обновлен')
      if (result.logo) {
        const path = result.logo.includes('?') ? result.logo : `${result.logo}?v=${Date.now()}`
        setPreviewLogo(`${API_URL}${path}`)
      }
      setPendingLogo('')
    } catch {
      message.error('Не удалось обновить логотип')
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!motoclub) return

    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      formData.append('parent_id', values.parent_id ? String(values.parent_id) : '')
      appendString(formData, 'desc', values.desc)
      if (values.birthday) formData.append('birthday', values.birthday.format('YYYY-MM-DD'))
      appendString(formData, 'website', values.website)
      appendString(formData, 'social_link', values.social_link)
      appendString(formData, 'phone', values.phone)
      appendString(formData, 'email', values.email)
      appendString(formData, 'address', values.address)
      appendString(formData, 'location', values.location)

      if (showModerationFields) {
        formData.append('publication_status', values.publication_status ? '1' : '0')
        formData.append('moderation_status', String(values.moderation_status ?? 0))
      }

      await updateMotoclub({ motoclub, payload: formData }).unwrap()
      message.success(
        showModerationFields
          ? 'Мотоклуб обновлен'
          : 'Мотоклуб обновлен и отправлен на модерацию',
      )
      navigate(backPath)
    } catch {
      message.error('Не удалось обновить мотоклуб')
    }
  }

  if (!motoclub) {
    return (
      <div className={isDashboard ? undefined : 'container'} style={{ marginTop: isDashboard ? 0 : 8 }}>
        <Typography.Text type="danger">Некорректный ID мотоклуба</Typography.Text>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={isDashboard ? undefined : 'container'} style={{ marginTop: isDashboard ? 0 : 8 }}>
        {isDashboard ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        )}
      </div>
    )
  }

  if (isError || !motoclubData) {
    return (
      <div className={isDashboard ? undefined : 'container'} style={{ marginTop: isDashboard ? 0 : 8 }}>
        <Typography.Text type="danger">Мотоклуб не найден</Typography.Text>
      </div>
    )
  }

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  return (
    <div className={isDashboard ? undefined : 'container'} style={{ marginTop: isDashboard ? 0 : 8 }}>
      <Link to={backPath}>
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          {backLabel}
        </Button>
      </Link>
      <Typography.Title level={4}>Редактировать мотоклуб</Typography.Title>
      <Card size="small">
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Typography.Text strong>Логотип (JPG, PNG)</Typography.Text>
                <ImageCropper
                  value={cropperValue}
                  onChange={(value) => {
                    if (value.startsWith('data:image')) setPendingLogo(value)
                    else {
                      setPendingLogo('')
                      if (!value) setPreviewLogo('')
                    }
                  }}
                  aspectRatio={1}
                  outputSize={{ width: 500, height: 500 }}
                  showOrientationSwitch={false}
                />
                <Button
                  type="primary"
                  htmlType="button"
                  loading={isUploadingLogo}
                  disabled={!hasNewLogoToUpload || isUploadingLogo}
                  onClick={() => void onLogoSubmit()}
                >
                  Обновить логотип
                </Button>
              </Space>
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
                    name="social_link"
                    label="Ссылка на соц. сеть"
                    rules={[
                      { type: 'url', message: 'Введите корректный URL' },
                      { pattern: noScriptPattern, message: 'Недопустимые символы' },
                    ]}
                  >
                    <Input placeholder="https://vk.ru/..." />
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

              {showModerationFields && (
                <Space size="large" style={{ width: '100%' }}>
                  <Form.Item name="publication_status" label="Публикация" valuePropName="checked">
                    <Switch checkedChildren="Опубликован" unCheckedChildren="Не опубликован" />
                  </Form.Item>
                  <Form.Item name="moderation_status" label="Модерация">
                    <Select style={{ minWidth: 220 }} options={moderationStatusOptions} />
                  </Form.Item>
                </Space>
              )}

              <Form.Item label="Город" required={!showModerationFields}>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item
                    name="address"
                    noStyle
                    rules={[
                      ...(showModerationFields
                        ? []
                        : [{ required: true, message: 'Укажите город' }]),
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
                  <Button type="primary" htmlType="button" onClick={handleAddressSearch}>
                    Найти
                  </Button>
                </Space.Compact>
              </Form.Item>

              <MapPicker
                searchValue={searchQuery}
                showSearchInput={false}
                initialLocation={motoclubData.location || undefined}
                onChangeLocation={(loc: string) => {
                  form.setFieldValue('location', loc)
                }}
              />

              <Form.Item
                name="location"
                label="Координаты"
                style={{ marginTop: 8, marginBottom: 8 }}
                rules={
                  showModerationFields
                    ? undefined
                    : [{ required: true, message: 'Выберите место на карте' }]
                }
              >
                <Input readOnly placeholder="Кликните по карте, чтобы получить координаты..." />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Сохранить
            </Button>
            <Button onClick={() => navigate(backPath)}>Отмена</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default EditMotoclub

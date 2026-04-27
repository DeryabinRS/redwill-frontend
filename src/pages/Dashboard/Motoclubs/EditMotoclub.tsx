import { App as AntdApp, Button, Card, Col, Form, Input, Row, Select, Skeleton, Space, Switch, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ImageCropper from '@components/ImageCropper'
import MapPicker from '@components/YandexMapV3/MapPicker'
import { API_URL } from '@config/constants'
import { base64ToFile, moderationStatusOptions, sanitizeInput } from '@utils/form'
import {
  useGetDashboardMotoclubQuery,
  useUpdateMotoclubMutation,
  useUploadMotoclubLogoMutation,
} from '@features/motoclub/motoclubSlice'

type FormValues = {
  name: string
  desc?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  location?: string
  publication_status: boolean
  moderation_status: number
}

function EditMotoclub() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { motoclub } = useParams<{ motoclub: string }>()
  const [form] = Form.useForm<FormValues>()
  const [logoForm] = Form.useForm()
  const [previewLogo, setPreviewLogo] = useState('')
  const [pendingLogo, setPendingLogo] = useState('')
  const [updateMotoclub, { isLoading: isUpdating }] = useUpdateMotoclubMutation()
  const [uploadMotoclubLogo, { isLoading: isUploadingLogo }] = useUploadMotoclubLogoMutation()

  const cropperValue = pendingLogo || previewLogo
  const hasNewLogoToUpload = Boolean(pendingLogo && pendingLogo.startsWith('data:image'))

  const {
    data: motoclubData,
    isLoading,
    isError,
  } = useGetDashboardMotoclubQuery(motoclub as string, {
    skip: !motoclub,
  })

  useEffect(() => {
    if (!motoclubData) return

    form.setFieldsValue({
      name: motoclubData.name,
      desc: motoclubData.desc || '',
      website: motoclubData.website || '',
      phone: motoclubData.phone || '',
      email: motoclubData.email || '',
      address: motoclubData.address || '',
      location: motoclubData.location || '',
      publication_status: Boolean(motoclubData.publication_status),
      moderation_status: motoclubData.moderation_status ?? 0,
    })

    if (motoclubData.logo) {
      setPreviewLogo(`${API_URL}${motoclubData.logo}`)
      setPendingLogo('')
    }
  }, [form, motoclubData])

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const onLogoSubmit = async () => {
    if (!motoclub) return
    if (!hasNewLogoToUpload) {
      message.warning('Выберите новый логотип')
      return
    }

    try {
      const file = await base64ToFile(pendingLogo, `motoclub_${Date.now()}.jpg`)
      if (!file) {
        message.error('Не удалось подготовить файл')
        return
      }

      const formData = new FormData()
      formData.append('logo', file)
      const result = await uploadMotoclubLogo({ motoclub, payload: formData }).unwrap()

      message.success('Логотип обновлен')
      if (result.logo) {
        setPreviewLogo(`${API_URL}${result.logo}`)
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
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'website', values.website)
      appendString(formData, 'phone', values.phone)
      appendString(formData, 'email', values.email)
      appendString(formData, 'address', values.address)
      appendString(formData, 'location', values.location)
      formData.append('publication_status', values.publication_status ? '1' : '0')
      formData.append('moderation_status', String(values.moderation_status))

      await updateMotoclub({ motoclub, payload: formData }).unwrap()
      message.success('Мотоклуб обновлен')
      navigate('/dashboard/motoclubs')
    } catch {
      message.error('Не удалось обновить мотоклуб')
    }
  }

  if (!motoclub) {
    return <Typography.Text type="danger">Некорректный ID мотоклуба</Typography.Text>
  }

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  if (isError || !motoclubData) {
    return <Typography.Text type="danger">Мотоклуб не найден</Typography.Text>
  }

  const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i

  const renderLogoForm = () => (
    <Form form={logoForm} layout="vertical" onFinish={onLogoSubmit}>
      <Form.Item label="Логотип (JPG, PNG)">
        <ImageCropper
          value={cropperValue}
          onChange={(value) => {
            if (value.startsWith('data:image')) setPendingLogo(value)
            else setPendingLogo('')
          }}
          aspectRatio={1}
          outputSize={{ width: 500, height: 500 }}
          showOrientationSwitch={false}
        />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={isUploadingLogo}
        disabled={!hasNewLogoToUpload || isUploadingLogo}
      >
        Обновить логотип
      </Button>
    </Form>
  )

  return (
    <div>
      <Link to="/dashboard/motoclubs">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          К списку мотоклубов
        </Button>
      </Link>
      <Typography.Title level={4}>Редактировать мотоклуб</Typography.Title>
      <Card size="small">
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              {renderLogoForm()}
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

              <Space size="large" style={{ width: '100%' }}>
                <Form.Item name="publication_status" label="Публикация" valuePropName="checked">
                  <Switch checkedChildren="Опубликован" unCheckedChildren="Не опубликован" />
                </Form.Item>
                <Form.Item name="moderation_status" label="Модерация">
                  <Select
                    style={{ minWidth: 220 }}
                    options={moderationStatusOptions}
                  />
                </Form.Item>
              </Space>

              <MapPicker
                initialLocation={motoclubData.location || undefined}
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
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Сохранить
            </Button>
            <Button onClick={() => navigate('/dashboard/motoclubs')}>
              Отмена
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default EditMotoclub

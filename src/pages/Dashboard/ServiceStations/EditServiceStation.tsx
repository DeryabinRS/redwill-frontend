import { App as AntdApp, Button, Card, Col, Form, Input, Row, Select, Skeleton, Space, Switch, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ImageCropper from '@components/ImageCropper'
import MapPicker from '@components/YandexMapV3/MapPicker'
import { API_URL } from '@config/constants'
import { base64ToFile, moderationStatusOptions, sanitizeInput } from '@utils/form'
import {
  useGetDashboardServiceStationQuery,
  useUpdateServiceStationMutation,
  useUploadServiceStationLogoMutation,
} from '@features/serviceStation/serviceStationSlice'

type FormValues = {
  name: string
  desc?: string
  website?: string
  address?: string
  location?: string
  phone?: string
  publication_status: boolean
  moderation_status: number
}

function EditServiceStation() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const { serviceStation } = useParams<{ serviceStation: string }>()
  const [form] = Form.useForm<FormValues>()
  const [logoForm] = Form.useForm()
  const [previewLogo, setPreviewLogo] = useState('')
  const [pendingLogo, setPendingLogo] = useState('')
  const [updateServiceStation, { isLoading: isUpdating }] = useUpdateServiceStationMutation()
  const [uploadServiceStationLogo, { isLoading: isUploadingLogo }] = useUploadServiceStationLogoMutation()

  const cropperValue = pendingLogo || previewLogo
  const hasNewLogoToUpload = Boolean(pendingLogo && pendingLogo.startsWith('data:image'))

  const {
    data: serviceStationData,
    isLoading,
    isError,
  } = useGetDashboardServiceStationQuery(serviceStation as string, {
    skip: !serviceStation,
  })

  useEffect(() => {
    if (!serviceStationData) return

    form.setFieldsValue({
      name: serviceStationData.name,
      desc: serviceStationData.desc || '',
      website: serviceStationData.website || '',
      address: serviceStationData.address || '',
      location: serviceStationData.location || '',
      phone: serviceStationData.phone || '',
      publication_status: Boolean(serviceStationData.publication_status),
      moderation_status: serviceStationData.moderation_status ?? 0,
    })

    if (serviceStationData.logo) {
      setPreviewLogo(`${API_URL}${serviceStationData.logo}`)
      setPendingLogo('')
    }
  }, [form, serviceStationData])

  const appendString = (formData: FormData, key: keyof FormValues, value?: string) => {
    if (value) formData.append(key, sanitizeInput(value))
  }

  const onLogoSubmit = async () => {
    if (!serviceStation) return
    if (!hasNewLogoToUpload) {
      message.warning('Выберите новый логотип')
      return
    }

    try {
      const file = await base64ToFile(pendingLogo, `service_station_${Date.now()}.jpg`)
      if (!file) {
        message.error('Не удалось подготовить файл')
        return
      }

      const formData = new FormData()
      formData.append('logo', file)
      const result = await uploadServiceStationLogo({ serviceStation, payload: formData }).unwrap()

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
    if (!serviceStation) return

    try {
      const formData = new FormData()
      formData.append('name', sanitizeInput(values.name))
      appendString(formData, 'desc', values.desc)
      appendString(formData, 'website', values.website)
      appendString(formData, 'phone', values.phone)
      appendString(formData, 'address', values.address)
      appendString(formData, 'location', values.location)
      formData.append('publication_status', values.publication_status ? '1' : '0')
      formData.append('moderation_status', String(values.moderation_status))

      await updateServiceStation({ serviceStation, payload: formData }).unwrap()
      message.success('СТО обновлена')
      navigate('/dashboard/service-stations')
    } catch {
      message.error('Не удалось обновить СТО')
    }
  }

  if (!serviceStation) {
    return <Typography.Text type="danger">Некорректный ID СТО</Typography.Text>
  }

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  if (isError || !serviceStationData) {
    return <Typography.Text type="danger">СТО не найдена</Typography.Text>
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
      <Link to="/dashboard/service-stations">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          К списку СТО
        </Button>
      </Link>
      <Typography.Title level={4}>Редактировать СТО</Typography.Title>
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
                  { required: true, message: 'Введите название СТО' },
                  { max: 255, message: 'Максимум 255 символов' },
                  { pattern: noScriptPattern, message: 'Недопустимые символы' },
                ]}
              >
                <Input placeholder="Название СТО" />
              </Form.Item>

              <Form.Item
                name="desc"
                label="Описание"
                rules={[{ pattern: noScriptPattern, message: 'Недопустимые символы' }]}
              >
                <Input.TextArea rows={4} placeholder="Краткое описание СТО" />
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

              <Space size="large" style={{ width: '100%' }}>
                <Form.Item name="publication_status" label="Публикация" valuePropName="checked">
                  <Switch checkedChildren="Опубликована" unCheckedChildren="Не опубликована" />
                </Form.Item>
                <Form.Item name="moderation_status" label="Модерация">
                  <Select
                    style={{ minWidth: 220 }}
                    options={moderationStatusOptions}
                  />
                </Form.Item>
              </Space>

              <MapPicker
                initialLocation={serviceStationData.location || undefined}
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
                <Input placeholder="Адрес СТО" />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={isUpdating}>
              Сохранить
            </Button>
            <Button onClick={() => navigate('/dashboard/service-stations')}>
              Отмена
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default EditServiceStation

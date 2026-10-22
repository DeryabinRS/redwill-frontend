import { App as AntdApp, Button, Checkbox, DatePicker, Flex, Form, Input, Modal, Tag, Typography } from 'antd'
import { EditOutlined, HomeOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import {
  useUpdateUserProfileMutation,
  type UserInfo,
} from '@features/user/userSlice'
import MapPicker from '@components/YandexMapV3/MapPicker'

type ProfileFormValues = {
  first_name?: string
  last_name?: string
  nick_name?: string
  city?: string
  phone?: string
  birthday?: Dayjs | null | undefined
  accommodation?: boolean
  accommodation_location?: string
}

type ProfilePersonalFormProps = {
  userInfo: Pick<
    UserInfo,
    'first_name' | 'last_name' | 'nick_name' | 'city' | 'phone' | 'birthday' | 'accommodation' | 'accommodation_location' | 'accommodation_address'
  >
  displayName: string
  handleLabel: string
  readOnly?: boolean
}

type AccommodationMapFieldProps = {
  value?: string
  onChange?: (value: string) => void
  address: string
  onAddressChange: (value: string) => void
}

function AccommodationMapField({ value, onChange, address, onAddressChange }: AccommodationMapFieldProps) {
  // Фиксируем начальную точку один раз при монтировании.
  // Если передавать актуальный value как initialLocation, то при каждом клике
  // MapPicker получит новый initialLocation и сбросит зум на 14 (см. useEffect в MapPicker).
  const [initialLocation] = useState(value)

  return (
    <>
      <MapPicker
        initialLocation={initialLocation || undefined}
        onChangeLocation={(val) => onChange?.(val)}
        onChangeAddress={onAddressChange}
      />
      {address ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 6 }}>
          {address}
        </Typography.Text>
      ) : null}
    </>
  )
}

export function ProfilePersonalForm({ userInfo, displayName, handleLabel, readOnly = false }: ProfilePersonalFormProps) {
  const { message } = AntdApp.useApp()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<ProfileFormValues>()
  const accommodationChecked = Form.useWatch('accommodation', form)
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation()
  const [accommodationAddress, setAccommodationAddress] = useState('')

  const filledFields = useMemo(() => {
    const fields: { label: string; value: string }[] = []

    if (userInfo.city?.trim()) {
      fields.push({ label: 'Город', value: userInfo.city.trim() })
    }
    if (userInfo.phone?.trim()) {
      fields.push({ label: 'Телефон', value: userInfo.phone.trim() })
    }
    if (userInfo.birthday && dayjs(userInfo.birthday).isValid()) {
      fields.push({
        label: 'Дата рождения',
        value: dayjs(userInfo.birthday).format('DD.MM.YYYY'),
      })
    }

    return fields
  }, [userInfo])

  const showAccommodation = Number(userInfo.accommodation) === 1

  const accommodationRequired = Boolean(accommodationChecked)

  const requiredLabel = (text: string, required: boolean) => (
    <span>
      {text}
      {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
    </span>
  )

  const fillForm = () => {
    const birthdayValue =
      userInfo.birthday && dayjs(userInfo.birthday).isValid()
        ? dayjs(userInfo.birthday)
        : undefined

    form.setFieldsValue({
      first_name: userInfo.first_name || '',
      last_name: userInfo.last_name || '',
      nick_name: userInfo.nick_name || '',
      city: userInfo.city || '',
      phone: userInfo.phone || '',
      birthday: birthdayValue,
      accommodation: Number(userInfo.accommodation) === 1,
      accommodation_location: userInfo.accommodation_location || '',
    })
    setAccommodationAddress(userInfo.accommodation_address || '')
  }

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateUserProfile({
        first_name: values.first_name?.trim() || null,
        last_name: values.last_name?.trim() || null,
        nick_name: values.nick_name?.trim() || null,
        city: values.city?.trim() || null,
        phone: values.phone?.trim() || null,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
        accommodation: values.accommodation ? 1 : null,
        accommodation_location: values.accommodation ? (values.accommodation_location?.trim() || null) : null,
        accommodation_address: values.accommodation ? (accommodationAddress.trim() || null) : null,
      }).unwrap()
      message.success('Профиль сохранён')
      setOpen(false)
    } catch {
      message.error('Не удалось сохранить профиль')
    }
  }

  return (
    <>
      <div className="profile-shell__dossier-head">
        <div className="profile-shell__section-label">
          {'Личная информация'}
          {!readOnly && <Button icon={<EditOutlined />} size="small" onClick={() => setOpen(true)} />}
        </div>
      </div>

      <Flex vertical gap="middle" style={{ width: '100%' }}>
        <div className="profile-shell__person">
          <h2 className="profile-shell__name profile-shell__name--section">{displayName}</h2>
          <p className="profile-shell__handle">{handleLabel}</p>
        </div>
        <Flex gap="middle" wrap="wrap">
          {filledFields.length === 0 && !showAccommodation ? (
            <p className="profile-shell__empty">{'Данные пока не заполнены'}</p>
          ) : (
            filledFields.map((field) => (
              <div key={`${field.label}-${field.value}`} className="profile-shell__field">
                <span className="profile-shell__field-label">{field.label}</span>
                <p className="profile-shell__field-value">{field.value}</p>
              </div>
            ))
          )}
        </Flex>
        {showAccommodation ? (
          <>
            <Tag icon={<HomeOutlined />} color="green">
              {'Готов разместить мотопутешественников'}
            </Tag>
            {userInfo.accommodation_address ? (
              <div className="profile-shell__field">
                <span className="profile-shell__field-label">{'Адрес размещения'}</span>
                <p className="profile-shell__field-value">{userInfo.accommodation_address}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </Flex>
      <Modal
        title={'Личная информация'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
        afterOpenChange={(visible) => {
          if (visible) fillForm()
        }}
      >
        <Form<ProfileFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => void onSubmit(values)}
        >
          <Form.Item name="first_name" label={'Имя'}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="last_name" label={'Фамилия'}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="nick_name" label={'Ник'}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="city" label={'Город'}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={requiredLabel('Телефон', accommodationRequired)}
            dependencies={['accommodation']}
            rules={[
              ({ getFieldValue: getAccommodation }) => ({
                validator(_rule: unknown, value: string | undefined) {
                  if (getAccommodation('accommodation') && !value?.trim()) {
                    return Promise.reject(new Error('Укажите телефон'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="birthday" label={'Дата рождения'}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" allowClear />
          </Form.Item>
          <Form.Item name="accommodation" valuePropName="checked">
            <Checkbox>{'Готов разместить мотопутешественников'}</Checkbox>
          </Form.Item>
          <small style={{ display: 'block', marginTop: -16, marginBottom: 16 }}>
            {'Соглашаясь с данным пунктом ваша информация будет доступна на карте'}
          </small>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              getFieldValue('accommodation') ? (
                <Form.Item
                  name="accommodation_location"
                  label={requiredLabel('Местоположение на карте', accommodationRequired)}
                  dependencies={['accommodation']}
                  rules={[
                    ({ getFieldValue: getAccommodation }) => ({
                      validator(_rule: unknown, value: string | undefined) {
                        if (getAccommodation('accommodation') && !value) {
                          return Promise.reject(new Error('Укажите местоположение на карте'))
                        }
                        return Promise.resolve()
                      },
                    }),
                  ]}
                >
                  <AccommodationMapField
                    address={accommodationAddress}
                    onAddressChange={setAccommodationAddress}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Flex justify="end" gap="small">
            <Button onClick={() => setOpen(false)}>{'Отмена'}</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {'Сохранить'}
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  )
}

import { App as AntdApp, Button, Checkbox, DatePicker, Flex, Form, Input, Modal, Tag } from 'antd'
import { EditOutlined, HomeOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useUpdateUserProfileMutation,
  type UserInfo,
} from '@features/user/userSlice'

type ProfileFormValues = {
  first_name?: string
  last_name?: string
  nick_name?: string
  city?: string
  phone?: string
  birthday?: Dayjs | null | undefined
  accommodation?: boolean
}

type ProfilePersonalFormProps = {
  userInfo: Pick<
    UserInfo,
    'first_name' | 'last_name' | 'nick_name' | 'city' | 'phone' | 'birthday' | 'accommodation'
  >
  displayName: string
  handleLabel: string
}

function ProfilePersonalForm({ userInfo, displayName, handleLabel }: ProfilePersonalFormProps) {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<ProfileFormValues>()
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation()

  const filledFields = useMemo(() => {
    const fields: { label: string; value: string }[] = []

    if (userInfo.city?.trim()) {
      fields.push({ label: t('profile.city'), value: userInfo.city.trim() })
    }
    if (userInfo.phone?.trim()) {
      fields.push({ label: t('profile.phone'), value: userInfo.phone.trim() })
    }
    if (userInfo.birthday && dayjs(userInfo.birthday).isValid()) {
      fields.push({
        label: t('profile.birthday'),
        value: dayjs(userInfo.birthday).format('DD.MM.YYYY'),
      })
    }

    return fields
  }, [userInfo, t])

  const showAccommodation = Number(userInfo.accommodation) === 1

  useEffect(() => {
    if (!open) return

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
    })
  }, [userInfo, form, open])

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
      }).unwrap()
      message.success(t('profile.profileUpdated'))
      setOpen(false)
    } catch {
      message.error(t('profile.profileUpdateError'))
    }
  }

  return (
    <>
      <div className="profile-shell__dossier-head">
        <div className="profile-shell__section-label">
          {t('profile.personalInfo')}
          <Button icon={<EditOutlined />} size="small" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Flex vertical gap="middle" style={{ width: '100%' }}>
        <div className="profile-shell__person">
          <h2 className="profile-shell__name profile-shell__name--section">{displayName}</h2>
          <p className="profile-shell__handle">{handleLabel}</p>
        </div>
        <Flex gap="middle" wrap="wrap">
          {filledFields.length === 0 && !showAccommodation ? (
            <p className="profile-shell__empty">{t('profile.personalInfoEmpty')}</p>
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
          <Tag icon={<HomeOutlined />} color="green">
            {t('profile.accommodation')}
          </Tag>
        ) : null}
      </Flex>
      <Modal
        title={t('profile.personalInfo')}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form<ProfileFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => void onSubmit(values)}
        >
          <Form.Item name="first_name" label={t('profile.firstName')}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="last_name" label={t('profile.lastName')}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="nick_name" label={t('profile.nickName')}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="city" label={t('profile.city')}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="phone" label={t('profile.phone')}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="birthday" label={t('profile.birthday')}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" allowClear />
          </Form.Item>
          <Form.Item name="accommodation" valuePropName="checked">
            <Checkbox>{t('profile.accommodation')}</Checkbox>
          </Form.Item>
          <Flex justify="end" gap="small">
            <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {t('common.save')}
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  )
}

export default ProfilePersonalForm

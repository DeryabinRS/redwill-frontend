import { App as AntdApp, Button, Form, Input, Result } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useResendVerificationMutation } from '@features/auth/authSlice'

type FormValues = { email: string }

function ResendVerification() {
  const [form] = Form.useForm<FormValues>()
  const [sent, setSent] = useState<string | null>(null)
  const { message } = AntdApp.useApp()
  const [resend, { isLoading } ] = useResendVerificationMutation()
  const { search } = useLocation()
  const query = useMemo(() => new URLSearchParams(search), [search])
  const emailFromQuery = query.get('email') || undefined

  const handleFinish = async (values: FormValues) => {
    try {
      const res = await resend({ email: values.email }).unwrap()
      const successMsg = res?.message || 'Письмо с подтверждением отправлено'
      setSent(values.email)
      message.success(successMsg)
    } catch (e: unknown) {
      const dataMessage = (e as { data?: { message?: string } })?.data?.message
      const errorMessage = (e as { message?: string })?.message
      message.error(dataMessage || errorMessage || 'Не удалось отправить письмо')
    }
  }

  if (sent) {
    return (
      <Result
        status="success"
        title="Письмо отправлено"
        subTitle={`Мы отправили ссылку подтверждения на ${sent}`}
        extra={<Link to="/login">Перейти к входу</Link>}
      />
    )
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark={false}
      initialValues={{ email: emailFromQuery }}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Введите e-mail' }, { type: 'email', message: 'Некорректный e-mail' }]}
      >
        <Input placeholder="you@example.com" autoComplete="email" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading} disabled={isLoading}>
          Отправить письмо повторно
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Вспомнили пароль? <Link to="/login">Войти</Link>
      </div>
    </Form>
  )
}

export default ResendVerification



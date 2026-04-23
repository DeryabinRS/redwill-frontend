import { App as AntdApp, Button, Form, Input, Result } from 'antd'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useForgotPasswordMutation } from '@features/auth/authSlice'

type FormValues = { email: string }

function ForgotPassword() {
  const [form] = Form.useForm<FormValues>()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { message } = AntdApp.useApp()
  const [forgot, { isLoading }] = useForgotPasswordMutation()

  const handleFinish = async (values: FormValues) => {
    try {
      const res = await forgot({ email: values.email }).unwrap()
      setSentTo(values.email)
      message.success(res?.message || 'Ссылка для восстановления отправлена')
    } catch (e: unknown) {
      const dataMessage = (e as { data?: { message?: string } })?.data?.message
      const errorMessage = (e as { message?: string })?.message
      message.error(dataMessage || errorMessage || 'Не удалось отправить ссылку')
    }
  }

  if (sentTo) {
    return (
      <Result
        status="success"
        title="Письмо отправлено"
        subTitle={`Мы отправили ссылку для восстановления на ${sentTo}`}
        extra={<Link to="/login">Вернуться ко входу</Link>}
      />
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Введите e-mail' }, { type: 'email', message: 'Некорректный e-mail' }]}
      >
        <Input placeholder="you@example.com" autoComplete="email" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading} disabled={isLoading}>
          Отправить ссылку
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Вспомнили пароль? <Link to="/login">Войти</Link>
      </div>
    </Form>
  )
}

export default ForgotPassword



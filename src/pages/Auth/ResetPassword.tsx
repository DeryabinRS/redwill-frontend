import { App as AntdApp, Button, Form, Input, Result } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useResetPasswordMutation } from '@features/auth/authSlice'

type FormValues = { password: string; confirmPassword: string }

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function ResetPassword() {
  const [form] = Form.useForm<FormValues>()
  const query = useQuery()
  const hash = query.get('hash') || ''
  const id = query.get('id') || ''
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const [done, setDone] = useState(false)
  const [reset, { isLoading }] = useResetPasswordMutation()

  const handleFinish = async (values: FormValues) => {
    try {
      const res = await reset({ id, hash, password: values.password }).unwrap()
      message.success(res?.message || 'Пароль успешно обновлен')
      setDone(true)
    } catch (e: unknown) {
      const dataMessage = (e as { data?: { message?: string } })?.data?.message
      const errorMessage = (e as { message?: string })?.message
      message.error(dataMessage || errorMessage || 'Не удалось обновить пароль')
    }
  }

  if (!hash) {
    return (
      <Result
        status="error"
        title="Не найден токен"
        subTitle="Ссылка для восстановления недействительна"
        extra={<Link to="/forgot-password">Запросить новую ссылку</Link>}
      />
    )
  }

  if (done) {
    return (
      <Result
        status="success"
        title="Пароль обновлен"
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            Войти
          </Button>
        }
      />
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
      <Form.Item label="Новый пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
        <Input.Password placeholder="Введите новый пароль" autoComplete="new-password" />
      </Form.Item>

      <Form.Item
        label="Подтвердите пароль"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          {
            required: true,
            message: 'Повторите пароль',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Пароли не совпадают'))
            },
          }),
        ]}
      >
        <Input.Password placeholder="Повторите пароль" autoComplete="new-password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading} disabled={isLoading}>
          Обновить пароль
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ResetPassword



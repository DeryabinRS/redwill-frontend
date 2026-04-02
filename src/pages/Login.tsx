import { App as AntdApp, Button, Form, Input, Result } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../features/auth/authSlice'
import { useLazyGetUserInfoQuery } from '../features/user/userSlice'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { setAuthToken } from '../utils/auth'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

type LoginFormValues = {
  email: string
  password: string
}

function Login() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form] = Form.useForm<LoginFormValues>()
  const [login, { isLoading, error }] = useLoginMutation()
  const [getUserInfo] = useLazyGetUserInfoQuery()
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()


  const handleFinish = async (values: LoginFormValues) => {
    if (!executeRecaptcha) {
      console.error('ReCaptcha не инициализирован');
      return;
    }

    try {
      // 1. Запрашиваем токен с действием 'register' (должно совпадать с бэкендом)
      const token = await executeRecaptcha('login');

      const response = await login({ ...values, recaptcha_token: token }).unwrap()
      setAuthToken(response.token)
      await getUserInfo().unwrap()
      message.success('Успешный вход')
      navigate('/')
    } catch (e: unknown) {


      const dataMessage = (e as { data?: { message?: string } })?.data?.message
      const errorMessage = (e as { message?: string })?.message
      message.error(dataMessage || errorMessage || 'Не удалось войти')
    }
  }

  if (error && 'status' in error && error.status === 403) {
    const err = error as FetchBaseQueryError
    const subTitle = (err.data as { message?: string } | undefined)?.message || 'Не удалось войти'
    return <Result status="error" title="Не удалось войти" subTitle={subTitle} extra={<Link to="/resend-verification">Отправить письмо повторно</Link>} />
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

      <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}> 
        <Input.Password placeholder="Пароль" autoComplete="current-password" />
      </Form.Item>

      <div style={{ textAlign: 'right', marginBottom: 8 }}>
        <Link to="/forgot-password">Забыли пароль?</Link>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading} disabled={isLoading}>
          Войти
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Нет аккаунта? <Link to="/register">Создать</Link>
      </div>
    </Form>
  )
}

export default Login




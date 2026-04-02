import { App as AntdApp, Button, Form, Input, Result } from 'antd'
import { Link } from 'react-router-dom'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useRegisterMutation } from '../features/auth/authSlice'

type RegisterFormValues = {
  first_name: string
  last_name: string
  email: string
  password: string
  confirmPassword: string
}

function Register() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form] = Form.useForm<RegisterFormValues>()
  const [register, { isLoading, isSuccess }] = useRegisterMutation()
  const { message } = AntdApp.useApp()

  const handleFinish = async (values: RegisterFormValues) => {
    if (!executeRecaptcha) {
      console.error('ReCaptcha не инициализирован');
      return;
    }

    try {
      // 1. Запрашиваем токен с действием 'register' (должно совпадать с бэкендом)
      const token = await executeRecaptcha('register');

      await register({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        recaptcha_token: token, // Передаем токен
      }).unwrap()
    } catch (e: unknown) {
      const dataMessage = (e as { data?: { message?: string } })?.data?.message
      const errorMessage = (e as { message?: string })?.message
      message.error(dataMessage || errorMessage || 'Не удалось создать аккаунт')
    }
  }

  if (isSuccess) {
    return (
      <Result 
        status="success" 
        title="Аккаунт создан"
        subTitle="Проверьте ваш email для подтверждения аккаунта"
        extra={<Link to="/login">Войти</Link>} 
      />
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
      <Form.Item label="Имя" name="first_name" rules={[{ required: true, message: 'Введите имя' }]}> 
        <Input placeholder="Иван" autoComplete="given-name" />
      </Form.Item>

      <Form.Item label="Фамилия" name="last_name" rules={[{ required: true, message: 'Введите фамилию' }]}> 
        <Input placeholder="Иванов" autoComplete="family-name" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Введите e-mail' }, { type: 'email', message: 'Некорректный e-mail' }]}
      >
        <Input placeholder="you@example.com" autoComplete="email" />
      </Form.Item>

      <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}> 
        <Input.Password placeholder="Пароль" autoComplete="new-password" />
      </Form.Item>

      <Form.Item
        label="Подтвердите пароль"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: 'Повторите пароль' },
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
          Создать аккаунт
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </Form>
  )
}

export default Register




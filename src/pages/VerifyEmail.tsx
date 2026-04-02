import { useEffect, useMemo, useRef } from 'react'
import { Button, Result, Spin } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useVerifyEmailMutation } from '../features/auth/authSlice'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function VerifyEmail() {
  const query = useQuery()
  const hash = query.get('hash') || undefined
  const id = query.get('id') || undefined
  const navigate = useNavigate()
  const calledRef = useRef(false);

  const [verifyEmail, { isLoading, isSuccess, isError, error, data }] = useVerifyEmailMutation()

  useEffect(() => {
    if (calledRef.current) return;            // защита от повторов (StrictMode)
    if (!hash && !id) return;                 // нет данных — не вызываем
    calledRef.current = true;
    verifyEmail({ hash, id });
  }, [hash, id, verifyEmail])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (isError && hash && id) {
    const dataMessage = (error as { data?: { message?: string } })?.data?.message
    const errorMessage = (error as { message?: string })?.message
    return (
      <Result
        status="error"
        title="Не удалось подтвердить email"
        subTitle={dataMessage || errorMessage}
        extra={
          <Button type="primary" onClick={() => navigate('/resend-verification')}>
            Повторно отправить письмо
          </Button>
        }
      />
    )
  }

  if (isSuccess) {
    return (
      <Result
        status="success"
        title="Email подтвержден"
        subTitle={data?.message || 'Учетная запись успешно активирована.'}
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            Войти
          </Button>
        }
      />
    )
  }

  return null
}

export default VerifyEmail



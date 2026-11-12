import { useEffect, useMemo, useRef } from 'react'
import { Button, Result, Spin } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useVerifyEmailMutation, type VerifyEmailRequest } from '@features/auth/authSlice'

// Ссылка из письма: /verify-email?id=&hash=&expires=&signature=
// API сверяет подпись, поэтому все четыре параметра нужны целиком.
const LINK_PARAMS = ['id', 'hash', 'expires', 'signature'] as const

function useLinkParams(): Partial<VerifyEmailRequest> {
  const { search } = useLocation()

  return useMemo(() => {
    const query = new URLSearchParams(search)

    return LINK_PARAMS.reduce<Partial<VerifyEmailRequest>>((acc, key) => {
      const value = query.get(key)
      if (value) acc[key] = value
      return acc
    }, {})
  }, [search])
}

function ResendLink() {
  const navigate = useNavigate()

  return (
    <Button type="primary" onClick={() => navigate('/resend-verification')}>
      Повторно отправить письмо
    </Button>
  )
}

function VerifyEmail() {
  const params = useLinkParams()
  const navigate = useNavigate()
  const calledRef = useRef(false)

  const complete = LINK_PARAMS.every((key) => Boolean(params[key]))

  const [verifyEmail, { isLoading, isSuccess, isError, error, data }] = useVerifyEmailMutation()

  useEffect(() => {
    if (calledRef.current) return;            // защита от повторов (StrictMode)
    if (!complete) return;                    // ссылка неполная — подтверждать нечем
    calledRef.current = true;
    verifyEmail(params as VerifyEmailRequest);
  }, [complete, params, verifyEmail])

  if (!complete) {
    return (
      <Result
        status="error"
        title="Ссылка недействительна"
        subTitle="Откройте ссылку из письма целиком или запросите новое письмо."
        extra={<ResendLink />}
      />
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    const dataMessage = (error as { data?: { message?: string } })?.data?.message
    const errorMessage = (error as { message?: string })?.message
    return (
      <Result
        status="error"
        title="Не удалось подтвердить email"
        subTitle={dataMessage || errorMessage}
        extra={<ResendLink />}
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

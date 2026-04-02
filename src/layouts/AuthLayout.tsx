import { Card, Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { GOOGLE_RECAPTCHA_SITE_KEY } from '../config/constants'

const { Content } = Layout

function AuthLayout() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={GOOGLE_RECAPTCHA_SITE_KEY}>
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Card>
            <Outlet />
          </Card>
        </div>
      </Content>
    </Layout>
    </GoogleReCaptchaProvider>
  )
}

export default AuthLayout





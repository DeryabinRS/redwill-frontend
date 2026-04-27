import { Card, Descriptions, Spin, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useGetUserInfoQuery } from '@features/user/userSlice'
import UserPosts from './Posts'

function Profile() {
  const { t } = useTranslation()
  const { data: userInfo, isLoading } = useGetUserInfoQuery()

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!userInfo) {
    return (
      <Card size="small">
        <Typography.Title level={4}>{t('profile.title')}</Typography.Title>
        <Typography.Text>{t('profile.loadError')}</Typography.Text>
      </Card>
    )
  }

  return (
    <div className="container" style={{ marginTop: 8 }}>
      <Card size="small">
        <Typography.Title level={4}>{t('profile.title')}</Typography.Title>
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label={t('profile.login')}>{userInfo.login}</Descriptions.Item>
          {/* <Descriptions.Item label={t('profile.lastName')}>{userInfo.last_name}</Descriptions.Item>
          <Descriptions.Item label={t('profile.firstName')}>{userInfo.first_name}</Descriptions.Item> */}
          <Descriptions.Item label={t('profile.email')}>{userInfo.email}</Descriptions.Item>
        </Descriptions>
      </Card>

      <UserPosts />
    </div>
  )
}

export default Profile

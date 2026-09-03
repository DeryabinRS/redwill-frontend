import { Flex, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { type UserInfo } from '@features/user/userSlice'

type ProfileAccountInfoProps = {
  userInfo: Pick<UserInfo, 'id' | 'login' | 'email'>
}

function ProfileAccountInfo({ userInfo }: ProfileAccountInfoProps) {
  const { t } = useTranslation()

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <div>
        <Typography.Text type="secondary">{t('profile.login')}</Typography.Text>
        <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
          {userInfo.login}
        </Typography.Title>
      </div>
      <div>
        <Typography.Text type="secondary">{t('profile.email')}</Typography.Text>
        <Typography.Title level={5} style={{ margin: '4px 0 0' }}>
          {userInfo.email}
        </Typography.Title>
      </div>
    </Flex>
  )
}

export default ProfileAccountInfo

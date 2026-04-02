import { Dropdown, type MenuProps } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const items: MenuProps['items'] = [
    {
      key: 'ru',
      label: 'Русский',
      onClick: () => i18n.changeLanguage('ru'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => i18n.changeLanguage('en'),
    },
  ]

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <GlobalOutlined style={{ cursor: 'pointer' }} />
    </Dropdown>
  )
}

export default LanguageSwitcher

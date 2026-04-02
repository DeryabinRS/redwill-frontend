import { Switch } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useTheme } from '../contexts/ThemeContext'

function ThemeSwitcher() {
  const { mode, toggleTheme } = useTheme()

  return (
    <Switch
      checked={mode === 'dark'}
      onChange={toggleTheme}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
    />
  )
}

export default ThemeSwitcher

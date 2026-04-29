import { Button } from 'antd'
import type { ButtonProps } from 'antd'
import './ThemeButton.css'

function ThemeButton({ className, type = 'primary', ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      type={type}
      className={['theme-button', className].filter(Boolean).join(' ')}
    />
  )
}

export default ThemeButton

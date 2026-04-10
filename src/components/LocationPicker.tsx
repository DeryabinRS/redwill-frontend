
import React, { useState } from 'react'
import { Input, Typography } from 'antd'

const { Text } = Typography

interface LocationPickerProps {
  value?: { latitude: number; longitude: number; address: string }
  onChange?: (value: { latitude: number; longitude: number; address: string } | undefined) => void
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const [address, setAddress] = useState(value?.address || '')


  const handleClear = () => {
    setAddress('')
    onChange?.(undefined)
  }

  return (
    <div>
  
      <div style={{ marginTop: 8 }}>
        <Input
          placeholder="Адрес"
          value={address}
          suffix={
            <a onClick={handleClear} style={{ cursor: 'pointer', color: '#ff4d4f' }}>Очистить</a>
          }
        />
        {value && (
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            Координаты: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </Text>
        )}
      </div>
    </div>
  )
}

export default LocationPicker
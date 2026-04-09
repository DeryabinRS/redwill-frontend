/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react'
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'
import { Input, Typography } from 'antd'

const { Text } = Typography

interface LocationPickerProps {
  value?: { latitude: number; longitude: number; address: string }
  onChange?: (value: { latitude: number; longitude: number; address: string } | undefined) => void
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const [address, setAddress] = useState(value?.address || '')

  // Москва по умолчанию
  const defaultLocation = {
    latitude: 55.755814,
    longitude: 37.617635,
  }

  const handleMapClick = useCallback(async (e: any) => {
    const coords = e.get('coords') as [number, number]
    
    // Обновляем координаты
    const newLocation = {
      latitude: coords[0],
      longitude: coords[1],
      address: '',
    }
    
    onChange?.(newLocation)

    // Получаем адрес через геокодирование
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
      )
      const data = await response.json()
      const foundAddress = data.display_name || `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
      setAddress(foundAddress)
      
      onChange?.({
        latitude: coords[0],
        longitude: coords[1],
        address: foundAddress,
      })
    } catch (error) {
      console.error('Geocoding error:', error)
      setAddress(`${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`)
      onChange?.({
        latitude: coords[0],
        longitude: coords[1],
        address: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
      })
    }
  }, [onChange])

  const handlePlacemarkDragEnd = useCallback((e: any) => {
    const coords = e.getTarget().geometry.getCoordinates() as [number, number]
    
    const newLocation = {
      latitude: coords[0],
      longitude: coords[1],
      address: address,
    }
    
    onChange?.(newLocation)
  }, [onChange, address])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    if (value) {
      onChange?.({ ...value, address: newAddress })
    }
  }

  const handleClear = () => {
    setAddress('')
    onChange?.(undefined)
  }

  const mapState = {
    center: value ? [value.latitude, value.longitude] : [defaultLocation.latitude, defaultLocation.longitude],
    zoom: 10,
  }

  return (
    <div>
      <YMaps>
        <Map
          defaultState={mapState}
          width="100%"
          height="300px"
          onClick={handleMapClick}
        >
          {value && (
            <Placemark
              geometry={[value.latitude, value.longitude]}
              defaultOptions={{
                draggable: true,
                preset: 'islands#redDotIcon',
              }}
              onDragEnd={handlePlacemarkDragEnd}
            />
          )}
        </Map>
      </YMaps>
      
      <div style={{ marginTop: 8 }}>
        <Input
          placeholder="Адрес"
          value={address}
          onChange={handleAddressChange}
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
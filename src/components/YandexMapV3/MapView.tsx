import { Alert, Skeleton } from 'antd'
import { useState } from 'react'
import { useYmaps3 } from '@hooks/useYmaps3'
import { parseLocationCoordinates } from '@utils/mapLocation'

type MapViewProps = {
  location: string
  /** Высота блока карты в px */
  height?: number
}

function MapView({ location, height = 400 }: MapViewProps) {
  const { isReady, error, reactify } = useYmaps3()
  const coords = parseLocationCoordinates(location)
  const [zoom, setZoom] = useState(14)

  if (!coords) {
    return null
  }

  if (error) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Не удалось загрузить карту"
      />
    )
  }

  if (!isReady || !reactify) {
    return <Skeleton active paragraph={{ rows: 4 }} />
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
  } = reactify.module(window.ymaps3)

  return (
    <div
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        height,
        width: '100%',
        position: 'relative',
      }}
    >
      <YMap
        location={{
          center: [coords.lng, coords.lat],
          zoom,
        }}
      >
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapMarker
          coordinates={reactify.useDefault([coords.lng, coords.lat])}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              transform: 'translate(-50%, -100%)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" fill="#dc2626" stroke="white" strokeWidth="2" />
              <circle cx="16" cy="12" r="4" fill="white" />
            </svg>
          </div>
        </YMapMarker>
      </YMap>

      <div
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((currentZoom) => Math.min(currentZoom + 1, 20))}
          style={{
            width: 28,
            height: 28,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            color: '#64748b',
          }}
          aria-label="Увеличить масштаб"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((currentZoom) => Math.max(currentZoom - 1, 2))}
          style={{
            width: 28,
            height: 28,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            color: '#64748b',
          }}
          aria-label="Уменьшить масштаб"
        >
          -
        </button>
      </div>
    </div>
  )
}

export default MapView

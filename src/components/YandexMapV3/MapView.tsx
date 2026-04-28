import { Alert, Skeleton } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useYmaps3 } from '@hooks/useYmaps3'
import { parseLocationCoordinates } from '@utils/mapLocation'

export type MapViewMarker = {
  id: string | number
  location: string | null
  title: string
  logo?: string | null
  href?: string
}

export interface MapViewProps {
  location?: string
  markers?: MapViewMarker[]
  /** Высота блока карты в px */
  height?: number
  /** Начальный масштаб карты */
  zoom?: number
}

type ParsedMarker = MapViewMarker & {
  coords: {
    lat: number
    lng: number
  }
}

function getClusterStep(zoom: number) {
  if (zoom >= 12) return 0
  if (zoom >= 10) return 0.02
  if (zoom >= 8) return 0.07
  if (zoom >= 6) return 0.18
  return 0.45
}

function groupMarkers(markers: ParsedMarker[], zoom: number) {
  const exactGroups = new Map<string, ParsedMarker[]>()
  markers.forEach((marker) => {
    const key = `${marker.coords.lat.toFixed(6)}:${marker.coords.lng.toFixed(6)}`
    exactGroups.set(key, [...(exactGroups.get(key) || []), marker])
  })

  const step = getClusterStep(zoom)
  if (step === 0) {
    return [...exactGroups.entries()].map(([id, group]) => ({
      id,
      coords: {
        lat: group.reduce((sum, marker) => sum + marker.coords.lat, 0) / group.length,
        lng: group.reduce((sum, marker) => sum + marker.coords.lng, 0) / group.length,
      },
      markers: group,
    }))
  }

  const groups = new Map<string, ParsedMarker[]>()
  markers.forEach((marker) => {
    const latKey = Math.round(marker.coords.lat / step)
    const lngKey = Math.round(marker.coords.lng / step)
    const key = `${latKey}:${lngKey}`
    groups.set(key, [...(groups.get(key) || []), marker])
  })

  return [...groups.entries()].map(([id, group]) => ({
    id,
    coords: {
      lat: group.reduce((sum, marker) => sum + marker.coords.lat, 0) / group.length,
      lng: group.reduce((sum, marker) => sum + marker.coords.lng, 0) / group.length,
    },
    markers: group,
  }))
}

function getSpiderCoordinates(center: { lat: number; lng: number }, index: number, total: number, zoom: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const radius = Math.max(0.00400, 0.0026 / Math.max(zoom, 1))
  return {
    lat: center.lat + Math.sin(angle) * radius,
    lng: center.lng + Math.cos(angle) * radius,
  }
}

function getZoomToExpandCluster(markers: ParsedMarker[], currentZoom: number) {
  for (let nextZoom = Math.floor(currentZoom) + 1; nextZoom <= 12; nextZoom += 1) {
    if (groupMarkers(markers, nextZoom).length > 1 || getClusterStep(nextZoom) === 0) {
      return nextZoom
    }
  }

  return Math.min(currentZoom + 1, 20)
}

function MapView({ location, markers, height = 400, zoom: initialZoom = 14 }: MapViewProps) {
  const { isReady, error, reactify } = useYmaps3()
  const [zoom, setZoom] = useState(initialZoom)
  const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null)
  const parsedMarkers = useMemo<ParsedMarker[]>(() => {
    if (markers?.length) {
      return markers
        .map((marker) => {
          const coords = parseLocationCoordinates(marker.location)
          if (!coords) return null
          return { ...marker, coords }
        })
        .filter((marker): marker is ParsedMarker => Boolean(marker))
    }

    const coords = parseLocationCoordinates(location)
    if (!coords) return []
    return [{ id: 'single', title: '', location: location || '', coords }]
  }, [location, markers])

  const mapCenter = useMemo(() => {
    if (!parsedMarkers.length) return null
    return {
      lat: parsedMarkers.reduce((sum, marker) => sum + marker.coords.lat, 0) / parsedMarkers.length,
      lng: parsedMarkers.reduce((sum, marker) => sum + marker.coords.lng, 0) / parsedMarkers.length,
    }
  }, [parsedMarkers])

  const markerGroups = useMemo(() => groupMarkers(parsedMarkers, zoom), [parsedMarkers, zoom])

  useEffect(() => {
    if (!mapCenter) return
    setCurrentCenter([mapCenter.lng, mapCenter.lat])
  }, [mapCenter])

  if (!mapCenter) {
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
    YMapListener,
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
          center: currentCenter || [mapCenter.lng, mapCenter.lat],
          zoom,
        }}
      >
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapListener
          onActionEnd={(event: { location: { center: [number, number]; zoom: number } }) => {
            setCurrentCenter(event.location.center)
            setZoom(event.location.zoom)
          }}
        />
        {markerGroups.flatMap((group) => {
          if (getClusterStep(zoom) === 0 && group.markers.length > 1) {
            return group.markers.map((marker, index) => {
              const spiderCoords = getSpiderCoordinates(group.coords, index, group.markers.length, zoom)
              return (
                <YMapMarker
                  key={`${group.id}:${marker.id}:spider`}
                  coordinates={[spiderCoords.lng, spiderCoords.lat]}
                >
                  <div style={{ transform: 'translate(-50%, -100%)' }}>
                    <MotoclubMapMarker marker={{ ...marker, coords: spiderCoords }} />
                  </div>
                </YMapMarker>
              )
            })
          }

          return [
            <YMapMarker
              key={group.id}
              coordinates={[group.coords.lng, group.coords.lat]}
            >
              <div style={{ transform: 'translate(-50%, -100%)' }}>
                {group.markers.length > 1 ? (
                  <button
                    type="button"
                    title={group.markers.map((marker) => marker.title).join(', ')}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                    }}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setCurrentCenter([group.coords.lng, group.coords.lat])
                      setZoom(getZoomToExpandCluster(group.markers, zoom))
                    }}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#cd2e2c',
                      color: '#fff',
                      fontWeight: 700,
                      border: '3px solid #fff',
                      boxShadow: '0 8px 20px rgba(0,0,0,.28)',
                      cursor: 'pointer',
                    }}
                  >
                    {group.markers.length}
                  </button>
                ) : (
                  <MotoclubMapMarker marker={group.markers[0]} />
                )}
              </div>
            </YMapMarker>,
          ]
        })}
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

function MotoclubMapMarker({ marker }: { marker: ParsedMarker }) {
  const content = (
    <div>
      {marker.logo ? (
        <img
          src={marker.logo}
          alt={marker.title}
          style={{
            width: 38,
            height: 38,
            background: '#fff',
            padding: '2px',
            boxShadow: '0 8px 20px rgba(0,0,0,.25)',
        border: '1px solid rgba(0,0,0,.08)',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: '32px',
            height: '32px',
            transform: 'translate(-2px, 0)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" fill="#dc2626" stroke="white" strokeWidth="2" />
            <circle cx="16" cy="12" r="4" fill="white" />
          </svg>
        </div>
      )}
    </div>
  )

  if (marker.href) {
    return (
      <Link to={marker.href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    )
  }

  return content
}

export default MapView

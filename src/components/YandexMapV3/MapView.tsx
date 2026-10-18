import { Alert, Col, Modal, Row, Skeleton, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useYmaps3, type YmapsRouteFeature } from '@hooks/useYmaps3'
import { parseLocationCoordinates } from '@utils/mapLocation'

export type MapViewMarker = {
  id: string | number
  location: string | null
  title: string
  logo?: string | null
  href?: string
  address?: string | null
  description?: string | null
}

export type HostUserMarker = {
  id: number
  name: string
  location: string | null
  address?: string | null
  avatar?: string | null
  phone?: string | null
}

export interface MapViewProps {
  location?: string
  markers?: MapViewMarker[]
  /** Пользователи, готовые разместить мотопутешественников */
  hostUsers?: HostUserMarker[]
  onHostClick?: (host: HostUserMarker) => void
  /** Высота блока карты в px */
  height?: number
  /** Начальный масштаб карты */
  zoom?: number
  /** Тип маршрута (по умолчанию — автомобильный) */
  routeType?: 'driving' | 'walking' | 'transit' | 'truck'
}

type UnifiedMarker = {
  id: string | number
  kind: 'post' | 'host'
  title: string
  coords: { lat: number; lng: number }
  logo?: string | null
  href?: string
  address?: string | null
  description?: string | null
  avatar?: string | null
  phone?: string | null
}

function getClusterStep(zoom: number) {
  if (zoom >= 12) return 0
  if (zoom >= 10) return 0.02
  if (zoom >= 8) return 0.07
  if (zoom >= 6) return 0.18
  return 0.45
}

function groupMarkers(markers: UnifiedMarker[], zoom: number) {
  const step = getClusterStep(zoom)
  const tolerance = step === 0 ? 1e-6 : step

  const n = markers.length
  if (n === 0) return []

  // Union-Find: транзитивно объединяем маркеры, находящиеся в пределах tolerance.
  // Это детерминированно (не зависит от порядка) и гарантирует, что если A близко к B,
  // а B близко к C — A, B и C попадут в один кластер.
  const parent = Array.from({ length: n }, (_, index) => index)

  const find = (x: number): number => {
    let root = x
    while (parent[root] !== root) root = parent[root]
    // Сжатие пути
    while (parent[x] !== x) {
      const next = parent[x]
      parent[x] = root
      x = next
    }
    return root
  }

  const union = (a: number, b: number) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootA] = rootB
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        Math.abs(markers[i].coords.lat - markers[j].coords.lat) <= tolerance &&
        Math.abs(markers[i].coords.lng - markers[j].coords.lng) <= tolerance
      ) {
        union(i, j)
      }
    }
  }

  // Группируем маркеры по корню
  const groups = new Map<number, UnifiedMarker[]>()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    const group = groups.get(root)
    if (group) group.push(markers[i])
    else groups.set(root, [markers[i]])
  }

  return [...groups.values()].map((clusterMarkers, index) => ({
    id: `cluster-${index}`,
    coords: {
      lat: clusterMarkers.reduce((sum, item) => sum + item.coords.lat, 0) / clusterMarkers.length,
      lng: clusterMarkers.reduce((sum, item) => sum + item.coords.lng, 0) / clusterMarkers.length,
    },
    markers: clusterMarkers,
  }))
}

function MapView({ location, markers, hostUsers, onHostClick, height = 400, zoom: initialZoom = 14, routeType = 'driving' }: MapViewProps) {
  const { isReady, error, reactify } = useYmaps3()
  const [zoom, setZoom] = useState(initialZoom)
  const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<UnifiedMarker | null>(null)
  const [clusterMarkers, setClusterMarkers] = useState<UnifiedMarker[] | null>(null)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [routeFeature, setRouteFeature] = useState<YmapsRouteFeature | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const unifiedMarkers = useMemo<UnifiedMarker[]>(() => {
    const list: UnifiedMarker[] = []

    if (markers?.length) {
      markers.forEach((marker) => {
        const coords = parseLocationCoordinates(marker.location)
        if (!coords) return
        list.push({
          id: marker.id,
          kind: 'post',
          title: marker.title,
          coords,
          logo: marker.logo,
          href: marker.href,
          address: marker.address,
          description: marker.description,
        })
      })
    } else {
      const coords = parseLocationCoordinates(location)
      if (coords) {
        list.push({ id: 'single', kind: 'post', title: '', coords })
      }
    }

    hostUsers?.forEach((host) => {
      const coords = parseLocationCoordinates(host.location)
      if (!coords) return
      list.push({
        id: host.id,
        kind: 'host',
        title: host.name,
        coords,
        address: host.address,
        avatar: host.avatar,
        phone: host.phone,
      })
    })

    return list
  }, [location, markers, hostUsers])

  const mapCenter = useMemo(() => {
    if (!unifiedMarkers.length) return null
    return {
      lat: unifiedMarkers.reduce((sum, marker) => sum + marker.coords.lat, 0) / unifiedMarkers.length,
      lng: unifiedMarkers.reduce((sum, marker) => sum + marker.coords.lng, 0) / unifiedMarkers.length,
    }
  }, [unifiedMarkers])

  const markerGroups = useMemo(() => groupMarkers(unifiedMarkers, zoom), [unifiedMarkers, zoom])

  // Сбрасываем линию маршрута при смене выбранного маркера
  useEffect(() => {
    setRouteFeature(null)
  }, [selectedMarker?.id])

  const getUserPosition = useCallback((): Promise<[number, number] | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGeoError('Геолокация не поддерживается браузером')
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve([position.coords.longitude, position.coords.latitude]),
        (err) => {
          setGeoError(
            err.code === err.PERMISSION_DENIED
              ? 'Доступ к геолокации запрещён'
              : 'Не удалось определить местоположение',
          )
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    })
  }, [])

  const locateUser = useCallback(async () => {
    setIsLocating(true)
    setGeoError('')
    const coords = await getUserPosition()
    setIsLocating(false)
    if (!coords) return
    setUserPosition(coords)
    setCurrentCenter(coords)
    setZoom(13)
  }, [getUserPosition])

  const buildRoute = useCallback(
    async (target: UnifiedMarker) => {
      const start = userPosition ?? (await getUserPosition())
      if (!start) return
      if (!userPosition) setUserPosition(start)

      // Строим прямую линию на карте (без вызова API Маршрутизации)
      const line: YmapsRouteFeature = {
        geometry: {
          type: 'LineString',
          coordinates: [start, [target.coords.lng, target.coords.lat]],
        },
      }
      setRouteFeature(line)
      setGeoError('')

      // Открываем Яндекс Карты с построенным маршрутом (бесплатно, без API-ключа)
      const mode = routeType === 'walking' ? 'pd' : routeType === 'transit' ? 'mt' : 'auto'
      const url = `https://yandex.ru/maps/?rtext=${start[1]},${start[0]}~${target.coords.lat},${target.coords.lng}&rtt=${mode}`
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    [getUserPosition, routeType, userPosition],
  )

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
    YMapFeature,
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
          onClick={() => {
            setSelectedMarker(null)
            setRouteFeature(null)
          }}
        />
        {markerGroups.map((group) => {
          if (group.markers.length === 1 && group.markers[0].kind === 'host') {
            const host = group.markers[0]
            return (
              <YMapMarker key={group.id} coordinates={[group.coords.lng, group.coords.lat]} zIndex={1200}>
                <HostMapMarker marker={host} onClick={() => onHostClick?.(toHostUserMarker(host))} />
              </YMapMarker>
            )
          }

          return (
            <YMapMarker key={group.id} coordinates={[group.coords.lng, group.coords.lat]}>
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
                      setClusterMarkers(group.markers)
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
                  <MotoclubMapMarker marker={group.markers[0]} onClick={() => setSelectedMarker(group.markers[0])} />
                )}
              </div>
            </YMapMarker>
          )
        })}

        {routeFeature ? (
          <YMapFeature
            geometry={routeFeature.geometry}
            style={{
              stroke: [{ width: 3, color: '#1e66f5', dash: [8, 6] }],
              simplificationRate: 0,
            }}
          />
        ) : null}

        {userPosition ? (
          <YMapMarker coordinates={userPosition} zIndex={1500}>
            <div style={{ transform: 'translate(-50%, -50%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" fill="#1e66f5" stroke="#fff" strokeWidth="3" />
                <circle cx="12" cy="12" r="3" fill="#fff" />
              </svg>
            </div>
          </YMapMarker>
        ) : null}

        {selectedMarker ? (
          <YMapMarker
            coordinates={[selectedMarker.coords.lng, selectedMarker.coords.lat]}
            zIndex={2000}
          >
            <div
              style={{ transform: 'translate(-50%, calc(-100% - 18px))' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                style={{
                  width: 240,
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 12px 32px rgba(0,0,0,.28)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedMarker(null)}
                  aria-label="Закрыть"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    zIndex: 2,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,.45)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
                {selectedMarker.logo ? (
                  <img
                    src={selectedMarker.logo}
                    alt={selectedMarker.title}
                    style={{ width: '100%', height: 110, objectFit: 'cover', background: '#f5f5f5' }}
                  />
                ) : null}
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: '#1a1a1a' }}>
                    {selectedMarker.title}
                  </div>
                  {selectedMarker.address ? (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      {selectedMarker.address}
                    </div>
                  ) : null}
                  {selectedMarker.href ? (
                    <Link
                      to={selectedMarker.href}
                      style={{ display: 'inline-block', marginTop: 8, fontSize: 13, fontWeight: 600, color: '#cd2e2c' }}
                    >
                      Подробнее →
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      buildRoute(selectedMarker)
                    }}
                    style={{
                      display: 'block',
                      marginTop: 8,
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1e66f5',
                      cursor: 'pointer',
                    }}
                  >
                    Маршрут в Яндекс Картах →
                  </button>
                </div>
              </div>
            </div>
          </YMapMarker>
        ) : null}
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
        <button
          type="button"
          onClick={locateUser}
          disabled={isLocating}
          aria-label="Моё местоположение"
          title="Моё местоположение"
          style={{
            width: 28,
            height: 28,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      {geoError ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            zIndex: 2,
            maxWidth: 280,
            background: '#fff',
            border: '1px solid #f3c2c2',
            color: '#dc2626',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,.12)',
          }}
        >
          {geoError}
        </div>
      ) : null}

      <ClusterModal
        markers={clusterMarkers}
        onClose={() => setClusterMarkers(null)}
        onBuildRoute={(marker) => void buildRoute(marker)}
      />
    </div>
  )
}

function ClusterModal({ markers, onClose, onBuildRoute }: {
  markers: UnifiedMarker[] | null
  onClose: () => void
  onBuildRoute?: (marker: UnifiedMarker) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [markers])

  const list = markers ?? []
  const selected = list[selectedIndex]

  return (
    <Modal
      open={list.length > 0}
      onCancel={onClose}
      footer={null}
      width={640}
      title={list.length > 1 ? `Объектов: ${list.length}` : undefined}
    >
      {selected ? (
        <Row gutter={16}>
          <Col span={10}>
            <div
              style={{
                maxHeight: 360,
                overflowY: 'auto',
                paddingRight: 8,
                borderRight: '1px solid #f0f0f0',
              }}
            >
              {list.map((item, index) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    marginBottom: 4,
                    border: 'none',
                    borderRadius: 6,
                    background: index === selectedIndex ? '#cd2e2c' : 'transparent',
                    color: index === selectedIndex ? '#fff' : 'var(--ant-color-text, #e5e7eb)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: index === selectedIndex ? 600 : 400,
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </Col>
          <Col span={14}>
            {selected.kind === 'host' ? (
              selected.avatar ? (
                <img
                  src={selected.avatar}
                  alt={selected.title}
                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%', marginBottom: 12 }}
                />
              ) : (
                <UserOutlined style={{ fontSize: 48, color: '#16a34a', marginBottom: 12 }} />
              )
            ) : selected.logo ? (
              <img
                src={selected.logo}
                alt={selected.title}
                style={{ width: 50, height: 50, objectFit: 'contain', borderRadius: 8, marginBottom: 12 }}
              />
            ) : null}
            <Typography.Title level={5} style={{ margin: 0 }}>
              {selected.title}
            </Typography.Title>
            {selected.address ? (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {selected.address}
              </Typography.Text>
            ) : null}
            {selected.phone ? (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {selected.phone}
              </Typography.Text>
            ) : null}
            {selected.kind === 'host' ? (
              <Link to={`/users/${selected.id}`} style={{ display: 'inline-block', marginTop: 12, fontWeight: 600, color: '#cd2e2c' }}>
                Профиль →
              </Link>
            ) : selected.href ? (
              <Link
                to={selected.href}
                style={{ display: 'inline-block', marginTop: 12, fontWeight: 600, color: '#cd2e2c' }}
              >
                Подробнее →
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                onBuildRoute?.(selected)
                onClose()
              }}
              style={{
                display: 'block',
                marginTop: 12,
                border: 'none',
                background: 'none',
                padding: 0,
                fontSize: 13,
                fontWeight: 600,
                color: '#1e66f5',
                cursor: 'pointer',
              }}
            >
              Маршрут в Яндекс Картах →
            </button>
          </Col>
        </Row>
      ) : null}
    </Modal>
  )
}

function toHostUserMarker(marker: UnifiedMarker): HostUserMarker {
  return {
    id: Number(marker.id),
    name: marker.title,
    location: null,
    address: marker.address ?? null,
    avatar: marker.avatar ?? null,
    phone: marker.phone ?? null,
  }
}

function HostMapMarker({ marker, onClick }: { marker: UnifiedMarker; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.()
      }}
      aria-label={marker.title}
      title={marker.title}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#16a34a',
        color: '#fff',
        border: '3px solid #fff',
        boxShadow: '0 6px 16px rgba(0,0,0,.28)',
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <UserOutlined style={{ fontSize: 16 }} />
    </button>
  )
}

function MotoclubMapMarker({ marker, onClick }: { marker: UnifiedMarker; onClick?: () => void }) {
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

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.()
      }}
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        display: 'block',
      }}
    >
      {content}
    </button>
  )
}

export default MapView

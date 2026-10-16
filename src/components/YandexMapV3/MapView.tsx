import { Alert, Col, Modal, Row, Skeleton, Typography } from 'antd'
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
  address?: string | null
  description?: string | null
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
  const step = getClusterStep(zoom)
  const tolerance = step === 0 ? 1e-6 : step

  type Cluster = {
    coords: { lat: number; lng: number }
    markers: ParsedMarker[]
  }

  const clusters: Cluster[] = []

  markers.forEach((marker) => {
    let target: Cluster | null = null

    for (const cluster of clusters) {
      const dLat = Math.abs(marker.coords.lat - cluster.coords.lat)
      const dLng = Math.abs(marker.coords.lng - cluster.coords.lng)
      if (dLat <= tolerance && dLng <= tolerance) {
        target = cluster
        break
      }
    }

    if (target) {
      target.markers.push(marker)
      target.coords = {
        lat: target.markers.reduce((sum, item) => sum + item.coords.lat, 0) / target.markers.length,
        lng: target.markers.reduce((sum, item) => sum + item.coords.lng, 0) / target.markers.length,
      }
    } else {
      clusters.push({
        coords: { lat: marker.coords.lat, lng: marker.coords.lng },
        markers: [marker],
      })
    }
  })

  return clusters.map((cluster, index) => ({
    id: `cluster-${index}`,
    coords: cluster.coords,
    markers: cluster.markers,
  }))
}

function MapView({ location, markers, height = 400, zoom: initialZoom = 14 }: MapViewProps) {
  const { isReady, error, reactify } = useYmaps3()
  const [zoom, setZoom] = useState(initialZoom)
  const [currentCenter, setCurrentCenter] = useState<[number, number] | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<ParsedMarker | null>(null)
  const [clusterMarkers, setClusterMarkers] = useState<ParsedMarker[] | null>(null)
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
          onClick={() => setSelectedMarker(null)}
        />
        {markerGroups.map((group) => (
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
        ))}

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
      </div>

      <ClusterModal markers={clusterMarkers} onClose={() => setClusterMarkers(null)} />
    </div>
  )
}

function ClusterModal({ markers, onClose }: { markers: ParsedMarker[] | null; onClose: () => void }) {
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
                  key={String(item.id)}
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
            {selected.logo ? (
              <img
                src={selected.logo}
                alt={selected.title}
                style={{
                  width: 50,
                  height: 50,
                  objectFit: 'contain',
                  borderRadius: 8,
                  marginBottom: 12,
                  background: '#f5f5f5',
                }}
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
            {selected.href ? (
              <Link
                to={selected.href}
                style={{ display: 'inline-block', marginTop: 12, fontWeight: 600, color: '#cd2e2c' }}
              >
                Подробнее →
              </Link>
            ) : null}
          </Col>
        </Row>
      ) : null}
    </Modal>
  )
}

function MotoclubMapMarker({ marker, onClick }: { marker: ParsedMarker; onClick?: () => void }) {
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

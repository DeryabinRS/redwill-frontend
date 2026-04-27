import { useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { useYmaps3 } from '../../hooks/useYmaps3';

const DEFAULT_CENTER: [number, number] = [50.618423, 55.751244]; // [lng, lat]
const DEFAULT_ZOOM = 4
const GEOCODER_API_KEY = 'c83cc3de-70ab-47e1-8168-76d252ad4f1e'

interface YMapClickEvent {
  coordinates: [number, number];
  screenCoordinates: [number, number];
  details: Record<string, unknown>;
}

export type AddressMode = 'full' | 'locality';

export interface IMapPicker {
  onChangeLocation: (val: string) => void; 
  onChangeAddress: (val: string) => void;
  initialLocation?: string;
  addressMode?: AddressMode;
  onlySearchInput?: boolean;
}

type GeocoderAddressComponent = {
  kind?: string
  name?: string
}

type GeocoderGeoObject = {
  name?: string
  description?: string
  Point?: {
    pos?: string
  }
  metaDataProperty?: {
    GeocoderMetaData?: {
      Address?: {
        Components?: GeocoderAddressComponent[]
      }
    }
  }
}

function parseLocation(location?: string) {
  if (!location) return null
  const [latValue, lngValue] = location.split(',').map((part) => Number(part.trim()))
  if (Number.isNaN(latValue) || Number.isNaN(lngValue)) return null
  return { lat: latValue, lng: lngValue }
}

function getLocalityName(geoObject: GeocoderGeoObject): string {
  const components = geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components || []
  return (
    components.find((component) => component.kind === 'locality')?.name ||
    components.find((component) => component.kind === 'province')?.name ||
    components.find((component) => component.kind === 'area')?.name ||
    ''
  )
}

function getAddressText(geoObject: GeocoderGeoObject, addressMode: AddressMode): string {
  if (addressMode === 'locality') {
    return getLocalityName(geoObject)
  }

  return geoObject.name || geoObject.description || ''
}

function MapPicker({
  onChangeLocation,
  onChangeAddress,
  initialLocation,
  addressMode = 'full',
  onlySearchInput = false,
}: IMapPicker) {
  const { isReady, error, reactify } = useYmaps3();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const parsed = parseLocation(initialLocation)
    if (!parsed) return
    setCoords(parsed)
    setCenter([parsed.lng, parsed.lat])
    setZoom(14)
  }, [initialLocation])

  const handleMapClick = useCallback((_object: unknown, event: YMapClickEvent) => {
    if (event?.coordinates) {
      const [lng, lat] = event.coordinates;
      setCoords({ lat, lng });
      setCenter([lng, lat])
      onChangeLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onChangeAddress('Поиск адреса...');
    }
  }, [onChangeAddress, onChangeLocation]);

  // Добавляем обработчик изменения камеры скролом
  const handleActionEnd = useCallback((event: { 
    location: { center: [number, number]; zoom: number };
    type: string;
  }) => {
    // Обновляем зум только если он изменился
    if (event.location.zoom !== zoom) {
      setZoom(event.location.zoom);
    }
    // Опционально: обновляем center, если нужно отслеживать панорамирование
    if (event.location.center[0] !== center[0] || event.location.center[1] !== center[1]) {
      setCenter(event.location.center);
    }
  }, [zoom, center]);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchError('Введите адрес или название места')
      return
    }

    setIsSearching(true)
    setSearchError('')

    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${GEOCODER_API_KEY}&geocode=${encodeURIComponent(query)}&format=json&results=1`
      )
      const data = await response.json()
      const geoObject = data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject as GeocoderGeoObject | undefined
      const position = geoObject?.Point?.pos?.split(' ').map(Number)
      const lngValue = position?.[0]
      const latValue = position?.[1]

      if (
        !geoObject ||
        typeof latValue !== 'number' ||
        typeof lngValue !== 'number' ||
        Number.isNaN(latValue) ||
        Number.isNaN(lngValue)
      ) {
        setSearchError('Место не найдено')
        return
      }

      const nextCoords = { lat: latValue, lng: lngValue }
      const address = getAddressText(geoObject, addressMode)

      setCoords(nextCoords)
      setCenter([nextCoords.lng, nextCoords.lat])
      setZoom(14)
      onChangeLocation(`${nextCoords.lat.toFixed(6)}, ${nextCoords.lng.toFixed(6)}`)
      onChangeAddress(address || 'Адрес не найден')
    } catch {
      setSearchError('Не удалось выполнить поиск')
    } finally {
      setIsSearching(false)
    }
  }, [addressMode, onChangeAddress, onChangeLocation, searchQuery])

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
  }

  // 📍 Обратное геокодирование при изменении координат
  useEffect(() => {
    if (!coords) {
      onChangeAddress('');
      return;
    }

    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${GEOCODER_API_KEY}&geocode=${coords.lng},${coords.lat}&format=json&results=1`
        );
        const data = await response.json();
        const geoObject = data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject as GeocoderGeoObject | undefined;
        if (geoObject) {
          const address = getAddressText(geoObject, addressMode)
          onChangeAddress(address || 'Адрес не найден');
        } else {
          onChangeAddress('Адрес не найден');
        }
      } catch {
        onChangeAddress('Ошибка при определении адреса');
      }
    };

    fetchAddress();
  }, [addressMode, coords, onChangeAddress]);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#dc2626', 
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        fontFamily: 'system-ui'
      }}>
        ❌ Ошибка загрузки карты: {error.message}
      </div>
    );
  }

  if (!isReady || !reactify) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        fontFamily: 'system-ui',
        color: '#64748b'
      }}>
        ⏳ Загрузка Яндекс.Карт...
      </div>
    );
  }

  const { 
    YMap, 
    YMapDefaultSchemeLayer, 
    YMapDefaultFeaturesLayer, 
    YMapMarker, 
    YMapListener,
  } = reactify.module(window.ymaps3);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 8 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Введите адрес или название места"
          />
          <Button
            type="primary"
            onClick={handleSearch}
            loading={isSearching}
          >
            Найти
          </Button>
        </Space.Compact>
        {searchError && (
          <Typography.Text type="danger" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            {searchError}
          </Typography.Text>
        )}
      </div>

      {/* 🔑 Контейнер с ЯВНОЙ высотой в пикселях — обязательно! */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        height: `400px`,
        // maxWidth: '650px',
        width: '100%',
        position: 'relative',
      }}>
        <YMap
          location={{
            center,
            zoom,
          }}
        >
          <YMapDefaultSchemeLayer />
          <YMapDefaultFeaturesLayer />

          {!onlySearchInput && <YMapListener onClick={handleMapClick} />}
          <YMapListener onActionEnd={handleActionEnd} />

          {coords && (
            <YMapMarker
              key={`${coords.lng}-${coords.lat}`}
              coordinates={reactify.useDefault([coords.lng, coords.lat])}
            >
              <div style={{
                width: '32px',
                height: '32px',
                transform: 'translate(-50%, -100%)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" fill="#dc2626" stroke="white" strokeWidth="2"/>
                  <circle cx="16" cy="12" r="4" fill="white"/>
                </svg>
              </div>
            </YMapMarker>
          )}
        </YMap>

        {/* Кастомный зум (работает стабильно, без antd) */}
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
    </div>
  );
}

export default MapPicker;
import { useState, useCallback, useEffect, type FC } from 'react';
import { useYmaps3 } from '../../hooks/useYmaps3';

const DEFAULT_CENTER: [number, number] = [37.618423, 55.751244]; // [lng, lat]

interface YMapClickEvent {
  coordinates: [number, number];
  screenCoordinates: [number, number];
  details: Record<string, unknown>;
}

interface IYandexMapV3Picker {
  onChacngeLocation: (val: string) => void; 
  onChacngeAddress: (val: string) => void;
}

const YandexMapV3Picker:FC<IYandexMapV3Picker> = ({ onChacngeLocation, onChacngeAddress }) => {
  const { isReady, error, reactify } = useYmaps3();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [address, setAddress] = useState('');

  const handleMapClick = useCallback((_object: unknown, event: YMapClickEvent) => {
    if (event?.coordinates) {
      const [lng, lat] = event.coordinates;
      setCoords({ lat, lng });
      onChacngeLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setInputValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setAddress('Поиск адреса...');
    }
  }, []);

  // 🔧 Хак: после монтирования карты принудительно обновляем её размер
  // Это нужно, потому что web-component может некорректно рассчитать высоту при первой отрисовке
  useEffect(() => {
    if (isReady && reactify) {
      const timer = setTimeout(() => {
        // Триггерим resize-событие для web-component
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReady, reactify]);

  // 📍 Обратное геокодирование при изменении координат
  useEffect(() => {
    if (!coords) {
      setAddress('');
      return;
    }

    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=c83cc3de-70ab-47e1-8168-76d252ad4f1e&geocode=${coords.lng},${coords.lat}&format=json&results=1`
        );
        const data = await response.json();
        const geoObject = data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;
        if (geoObject) {
          setAddress(geoObject.name || geoObject.description || 'Адрес не найден');
          onChacngeAddress(geoObject.name || geoObject.description || '')
        } else {
          setAddress('Адрес не найден');
        }
      } catch {
        setAddress('Ошибка при определении адреса');
      }
    };

    fetchAddress();
  }, [coords]);

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
    <div style={{ maxWidth: '650px', fontFamily: 'system-ui, sans-serif' }}>
      {/* 🔑 Контейнер с ЯВНОЙ высотой в пикселях — обязательно! */}
      <div style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        height: `400px`,
        width: '100%',
        position: 'relative'
      }}>
        <YMap
          location={reactify.useDefault({ center: DEFAULT_CENTER, zoom: 10 })}
        >
          <YMapDefaultSchemeLayer />
          <YMapDefaultFeaturesLayer />

          <YMapListener onClick={handleMapClick} />

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
      </div>
      <div style={{ marginTop: '12px' }}>
        <label htmlFor="v3-address" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Адрес:
        </label>
        <input
          id="v3-address"
          type="text"
          value={address}
          readOnly
          placeholder="Кликните по карте, чтобы определить адрес..."
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '15px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        <label htmlFor="v3-coords" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Координаты выбранной точки:
        </label>
        <input
          id="v3-coords"
          type="text"
          value={inputValue}
          readOnly
          placeholder="Кликните по карте, чтобы получить координаты..."
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '15px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

export default YandexMapV3Picker;
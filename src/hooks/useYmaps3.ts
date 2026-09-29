// src/hooks/useYmaps3.ts
import { useState, useEffect, type ComponentType } from 'react';

export interface Ymaps3API {
  ready: Promise<void>;
  import: (moduleName: string) => Promise<unknown>;
}

type YmapsComponent = ComponentType<Record<string, unknown>>;

export type Ymaps3Reactify = {
  module: (ymaps3: unknown) => {
    YMap: YmapsComponent;
    YMapDefaultSchemeLayer: YmapsComponent;
    YMapDefaultFeaturesLayer: YmapsComponent;
    YMapMarker: YmapsComponent;
    YMapControls: YmapsComponent;
    YMapZoomControl: YmapsComponent;
    YMapListener: YmapsComponent;
  };
  useDefault: (coords: [number, number]) => unknown;
};

declare global {
  interface Window {
    ymaps3?: Ymaps3API;
  }
}

export function useYmaps3() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reactify, setReactify] = useState<Ymaps3Reactify | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Ждём, пока скрипт загрузится и создаст глобальный ymaps3
        if (!window.ymaps3) {
          await new Promise<void>((resolve, reject) => {
            const check = () => {
              if (window.ymaps3) resolve();
              else setTimeout(check, 50);
            };
            check();
            // Таймаут на случай проблем с загрузкой
            setTimeout(() => reject(new Error('Yandex Maps API v3 не загрузился за 10 сек')), 10000);
          });
        }

        // Ждём готовности API
        await window.ymaps3!.ready;

        // Импортируем reactify-модуль
        const ymaps3React = (await window.ymaps3!.import('@yandex/ymaps3-reactify')) as {
          reactify: { bindTo: (react: unknown, reactDom: unknown) => unknown };
        };
        
        if (!isMounted) return;
        
        // bindTo требует передачи React и ReactDOM
        const reactified = ymaps3React.reactify.bindTo(
          await import('react'),
          await import('react-dom')
        ) as Ymaps3Reactify;
        
        setReactify(reactified);
        setIsReady(true);
      } catch (err) {
        if (isMounted) {
          console.error('Ошибка инициализации Яндекс.Карт v3:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isReady, error, reactify };
}
// src/hooks/useYmaps3.ts
import { useState, useEffect } from 'react';

export interface Ymaps3API {
  ready: Promise<void>;
  import: (moduleName: string) => Promise<any>;
}

declare global {
  interface Window {
    ymaps3?: Ymaps3API;
  }
}

export function useYmaps3() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reactify, setReactify] = useState<any>(null);

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
        const ymaps3React = await window.ymaps3!.import('@yandex/ymaps3-reactify');
        
        if (!isMounted) return;
        
        // bindTo требует передачи React и ReactDOM
        const reactified = ymaps3React.reactify.bindTo(
          await import('react'),
          await import('react-dom')
        );
        
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
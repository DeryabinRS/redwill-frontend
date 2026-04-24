// src/lib/ymaps.ts
import React from 'react';
import * as ReactDOM from 'react-dom';

// Ждём загрузки API и импортируем reactify-модуль
const [ymaps3React] = await Promise.all([
  // @ts-ignore - ymaps3 появляется глобально после загрузки скрипта
  ymaps3.import('@yandex/ymaps3-reactify'),
  // @ts-ignore
  ymaps3.ready,
]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);

// Экспортируем компоненты для удобного импорта
export const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapControls,
  YMapZoomControl,
} = reactify.module(ymaps3);

// Типы для TypeScript (опционально)
// Для работы типов установите: npm i -D @yandex/ymaps3-types
export type { YMapLocationRequest } from 'ymaps3';
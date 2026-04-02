import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import type { Locale } from 'antd/es/locale'
import ruRU from 'antd/locale/ru_RU'
import enUS from 'antd/locale/en_US'

import 'antd/dist/reset.css'
import './index.css'
import './i18n'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store'

const getAntdLocale = (): Locale => {
  const lang = localStorage.getItem('i18nextLng') || 'ru'
  return lang === 'en' ? enUS : ruRU
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={getAntdLocale()}>
        <AntdApp>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)

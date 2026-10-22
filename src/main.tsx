import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import ruRU from 'antd/locale/ru_RU'

import 'antd/dist/reset.css'
import './index.css'
import './styles/shell.css'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop'
import YandexMetrika from './components/YandexMetrika'
import { Provider } from 'react-redux'
import { store } from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={ruRU}>
        <AntdApp>
          <BrowserRouter>
            <ScrollToTop />
            <YandexMetrika />
            <App />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)

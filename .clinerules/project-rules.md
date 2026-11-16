# Правила проекта RWill Frontend (MotoWing / lapif)

## Стек
- React 19 + TypeScript 6 + Vite 7 (dev-сервер: `npm run dev`, порт 3100)
- UI: Ant Design 6 (antd) + @ant-design/icons
- Состояние: Redux Toolkit (RTK Query для API), стор в `src/store`
- Роутинг: react-router-dom 7
- Линт: ESLint 9 (flat config, `npm run lint`)
- Прочее: TinyMCE 8, reCAPTCHA v3, Яндекс.Карты (ymaps3), react-image-crop, dayjs

## Архитектура
- Feature-based структура: `src/{api, components, config, contexts, features, hooks, layouts, pages, store, styles, types, utils}`
- Алиасы путей (vite.config.ts + tsconfig): `@config`, `@components`, `@features`, `@hooks`, `@utils`, `@pages`
- API-слой: RTK Query, общий `baseQuery` в `src/api/baseQuery.ts`:
  - baseUrl: `VITE_APP_API_URL` (локально `http://rwill.local`) или `/api`
  - `credentials: 'include'` — HttpOnly-cookie сессия Laravel Sanctum
  - автоподстановка `Authorization: Bearer <token>` из cookie
  - централизованный выход при 401 (`src/utils/auth`)
- Конфиг/константы: `src/config/constants.ts` (SITE_NAME, API_URL, reCAPTCHA key — из env)

## Бэкенд (важно!)
- API-бэкенд — отдельный проект Laravel 12: `D:\webserver\OSPanel\domains\rwill.local`
  (репозиторий redwill-backend, OSPanel).
- Маршруты бэкенда БЕЗ префикса `/api` (`apiPrefix: ''`), аутентификация — Sanctum.
- При расхождении контракта API — сверяться с `routes/api.php` и контроллерами бэкенда.
- Общий multi-root воркспейс для обоих проектов: `D:\webserver\rwill.code-workspace`.
- ВНИМАНИЕ: при работе через rwill.code-workspace (multi-root) Cline загружает
  правила и MCP только из ПЕРВОЙ папки (бэкенд). Данный `.clinerules` работает,
  когда фронтенд открыт как отдельная папка (однокорневой воркспейс).

## Команды
- Dev: `npm run dev` (http://localhost:3100)
- Build: `npm run build` (tsc -b && vite build --mode production)
- Lint: `npm run lint`
- Preview: `npm run preview`

## MCP
- Настройки MCP-серверов проекта: `.clinerules/mcp_settings.json`
- `context7` — актуальная документация библиотек. В проекте ОЧЕНЬ свежие версии
  (React 19, antd 6, TS 6, Vite 7, react-router 7) — перед использованием API
  библиотек проверять документацию через context7, не полагаться на знания модели.
- `playwright` — браузерная автоматизация: проверка UI на http://localhost:3100
  (требуется запущенный `npm run dev` и бэкенд на rwill.local через OSPanel).

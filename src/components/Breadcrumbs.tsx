import { Breadcrumb } from 'antd'
import { Link, matchRoutes, useLocation } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import './Breadcrumbs.css'

type CrumbHandle = {
  crumb: string
  /** Переопределить ссылку (иначе используется путь маршрута). */
  href?: string
}

/**
 * Карта маршрутов → подписи для хлебных крошек.
 * Структура вложенная, чтобы matchRoutes() строил полную цепочку
 * «Главная / Раздел / Страница».
 */
const breadcrumbRoutes: RouteObject[] = [
  {
    path: '/',
    handle: { crumb: 'Главная' },
    children: [
      { path: 'about', handle: { crumb: 'О проекте' } },
      { path: 'calendar', handle: { crumb: 'Календарь' } },

      // События (без отдельной страницы-списка, детальная ведёт на «Календарь»)
      { path: 'posts/create', handle: { crumb: 'Создание события' } },
      {
        path: 'posts',
        handle: { crumb: 'Календарь', href: '/calendar' },
        children: [
          { path: ':post', handle: { crumb: 'Событие' } },
        ],
      },

      {
        path: 'motoclubs',
        handle: { crumb: 'Мотоклубы' },
        children: [
          { path: 'create', handle: { crumb: 'Создание мотоклуба' } },
          { path: ':motoclub', handle: { crumb: 'Мотоклуб' } },
          { path: ':motoclub/edit', handle: { crumb: 'Редактирование' } },
          { path: ':motoclub/members', handle: { crumb: 'Участники' } },
        ],
      },
      {
        path: 'motobars',
        handle: { crumb: 'Мотобары' },
        children: [
          { path: 'create', handle: { crumb: 'Создание мотобара' } },
          { path: ':motobar', handle: { crumb: 'Мотобар' } },
        ],
      },
      {
        path: 'moto-posts',
        handle: { crumb: 'Мото-посты' },
        children: [
          { path: 'create', handle: { crumb: 'Создание мото-поста' } },
          { path: ':motoPost', handle: { crumb: 'Мото-пост' } },
        ],
      },
      {
        path: 'service-stations',
        handle: { crumb: 'СТО' },
        children: [
          { path: 'create', handle: { crumb: 'Создание СТО' } },
          { path: ':serviceStation', handle: { crumb: 'СТО' } },
        ],
      },

      { path: 'users/:id', handle: { crumb: 'Профиль' } },
      {
        path: 'profile',
        handle: { crumb: 'Профиль' },
        children: [
          { path: 'posts/:post/edit', handle: { crumb: 'Редактирование события' } },
        ],
      },
      { path: 'notifications', handle: { crumb: 'Уведомления' } },

      {
        path: 'dashboard',
        handle: { crumb: 'Dashboard' },
        children: [
          {
            path: 'users',
            handle: { crumb: 'Пользователи' },
            children: [{ path: ':id', handle: { crumb: 'Пользователь' } }],
          },
          {
            path: 'posts',
            handle: { crumb: 'События' },
            children: [
              { path: 'create', handle: { crumb: 'Создание' } },
              { path: ':post', handle: { crumb: 'Событие' } },
              { path: ':post/edit', handle: { crumb: 'Редактирование' } },
            ],
          },
          {
            path: 'motoclubs',
            handle: { crumb: 'Мотоклубы' },
            children: [
              { path: 'create', handle: { crumb: 'Создание' } },
              { path: ':motoclub/edit', handle: { crumb: 'Редактирование' } },
              { path: ':motoclub/members', handle: { crumb: 'Участники' } },
            ],
          },
          {
            path: 'motobars',
            handle: { crumb: 'Мотобары' },
            children: [
              { path: 'create', handle: { crumb: 'Создание' } },
              { path: ':motobar/edit', handle: { crumb: 'Редактирование' } },
            ],
          },
          {
            path: 'moto-posts',
            handle: { crumb: 'Мото-посты' },
            children: [
              { path: 'create', handle: { crumb: 'Создание' } },
              { path: ':motoPost/edit', handle: { crumb: 'Редактирование' } },
            ],
          },
          {
            path: 'service-stations',
            handle: { crumb: 'СТО' },
            children: [
              { path: 'create', handle: { crumb: 'Создание' } },
              { path: ':serviceStation/edit', handle: { crumb: 'Редактирование' } },
            ],
          },
          { path: 'messages', handle: { crumb: 'Сообщения' } },
          { path: 'orders', handle: { crumb: 'Заказы' } },
          { path: 'settings', handle: { crumb: 'Настройки' } },
        ],
      },
    ],
  },
]

type BreadcrumbsProps = {
  /** Обернуть в `.container` (для страниц основного сайта). */
  contained?: boolean
}

function Breadcrumbs({ contained = false }: BreadcrumbsProps) {
  const location = useLocation()
  const matches = matchRoutes(breadcrumbRoutes, location)

  if (!matches || matches.length <= 1) {
    return null
  }

  const items = matches.flatMap((match, index) => {
    const handle = match.route.handle as CrumbHandle | undefined
    const label = handle?.crumb
    if (!label) return []

    const isLast = index === matches.length - 1
    const to = handle?.href ?? match.pathname

    return [
      {
        title: isLast ? (
          <span className="breadcrumbs__current">{label}</span>
        ) : (
          <Link to={to}>{label}</Link>
        ),
      },
    ]
  })

  if (items.length <= 1) {
    return null
  }

  return (
    <div className={contained ? 'container' : undefined}>
      <div className="breadcrumbs">
        <Breadcrumb items={items} separator="›" />
      </div>
    </div>
  )
}

export default Breadcrumbs

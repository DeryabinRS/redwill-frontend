import type { ReactNode } from 'react'

type ShellHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

/**
 * Шапка страницы: «eyebrow» + крупный заголовок Oswald + подзаголовок и
 * необязательные действия (chips/кнопки) справа.
 */
export function ShellHeader({ eyebrow, title, subtitle, actions }: ShellHeaderProps) {
  return (
    <header className="shell__masthead">
      <div>
        {eyebrow ? <span className="shell__eyebrow">{eyebrow}</span> : null}
        <h1 className="shell__title">{title}</h1>
        {subtitle ? <p className="shell__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shell__meta">{actions}</div> : null}
    </header>
  )
}

import type { ReactNode } from 'react'

type ShellProps = {
  children: ReactNode
  className?: string
}

/**
 * Панель-обёртка в единой стилистике «shell» (тёмная панель с градиентами,
 * акцентной подсветкой и сеткой), как в профиле.
 */
export function Shell({ children, className = '' }: ShellProps) {
  return <section className={`shell ${className}`.trim()}>{children}</section>
}

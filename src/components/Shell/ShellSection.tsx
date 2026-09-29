import type { ReactNode } from 'react'

type ShellSectionProps = {
  label?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Секция внутри shell-панели: заголовок-лейбл с декоративной линией и контент.
 */
export function ShellSection({ label, actions, children, className = '' }: ShellSectionProps) {
  const hasHead = Boolean(label) || Boolean(actions)

  return (
    <section className={`shell__section ${className}`.trim()}>
      {hasHead ? (
        <div className="shell__section-head">
          {label ? <h2 className="shell__section-label">{label}</h2> : null}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  )
}

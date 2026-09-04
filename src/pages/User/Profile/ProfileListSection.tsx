import type { ReactNode } from 'react'

type ProfileListSectionProps = {
  title: string
  count?: number
  children: ReactNode
  pagination?: ReactNode
}

function ProfileListSection({ title, count, children, pagination }: ProfileListSectionProps) {
  return (
    <section className="profile-list-section">
      <header className="profile-list-section__head">
        <h3 className="profile-list-section__title">{title}</h3>
        {count != null ? <span className="profile-list-section__count">{count}</span> : null}
      </header>
      <div className="profile-list-section__grid">{children}</div>
      {pagination}
    </section>
  )
}

export default ProfileListSection

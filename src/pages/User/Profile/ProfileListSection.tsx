import { Col, Row } from 'antd'
import { Children } from 'react'
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
      <Row gutter={[12, 12]}>
        {Children.map(children, (child) => (
          <Col xs={24} sm={12} lg={8}>
            {child}
          </Col>
        ))}
      </Row>
      {pagination}
    </section>
  )
}

export default ProfileListSection

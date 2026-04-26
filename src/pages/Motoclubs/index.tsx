import { Card, Typography } from 'antd'

function Motoclubs() {
  return (
    <section className="section" style={{ padding: '30px 0' }}>
      <div className="container">
        <Card>
          <Typography.Title level={2} style={{ marginTop: 0 }}>
            Мотоклубы
          </Typography.Title>
          <Typography.Paragraph>
            Раздел с мотоклубами находится в разработке.
          </Typography.Paragraph>
        </Card>
      </div>
    </section>
  )
}

export default Motoclubs

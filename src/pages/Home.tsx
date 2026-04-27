import { Col, Row, Typography } from 'antd'
import { ScheduleOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'
// import { useTranslation } from 'react-i18next'
import MapHeaderCanvas from '../components/MapHeaderCanvas/MapHeaderCanvas'
import PostFeed from '../components/PostFeed'

function Home() {
  // const { t } = useTranslation()

  const cardData = [
    {title: 'Календарь', desc: '', icon: <ScheduleOutlined style={{ fontSize: 28 }} /> },
    {title: 'Мотоклубы', desc: '', icon: <ShopOutlined style={{ fontSize: 28 }} /> },
    {title: 'Байк-посты, бары', desc: '', icon: <TeamOutlined style={{ fontSize: 28 }} /> },
    {title: 'СТО', desc: '', icon: <ToolOutlined style={{ fontSize: 28 }} /> },
  ];

  const renderCard = () => cardData.map(item => (
    <Col key={item.title} xs={12} lg={6} xl={4}>
      <div className="card-stripes" style={{ height: '100%' }}>
          <div className="stripe-bg"></div>
          <div className="stripe-border"></div>
          <div className="content">
            <div style={{ paddingRight: 12, paddingTop: 4, textAlign: 'center' }}>{item.icon}</div>
            <div>
              <Typography.Title level={5} style={{ margin: 0, textAlign: 'center', color: '#a0a0a0' }}>
                {item.title}
              </Typography.Title>
              <Typography.Paragraph style={{ color: '#a1a1a1' }}>
                {item.desc}
              </Typography.Paragraph>
            </div>
          </div>
      </div>
    </Col>
  ));

  return (
    <>
      <section className="section section__header" style={{ padding: '8px 0' }}>
        <MapHeaderCanvas />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Row gutter={[8, 8]}>
            {renderCard()}
          </Row>
        </div>
      </section>

      <section className="section" style={{ padding: '30px 0', marginTop: -120 }}>
        <div className="container">
          <PostFeed title="Ближайшие события" />
        </div>
      </section>
    </>
  )
}

export default Home



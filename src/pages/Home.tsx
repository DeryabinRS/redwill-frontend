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

  const renderCard = () => cardData.map((item, index) => (
    <Col key={item.title} xs={12} lg={6} xl={4}>
      <div className="card-stripes" style={{ height: '100%' }}>
          <div className="stripe-bg"></div>
          <div className="stripe-border"></div>
          <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
          <div className="content">
            <div className="card-switch-icon">{item.icon}</div>
            <div>
              <Typography.Title level={5} className="card-switch-title">
                {item.title}
              </Typography.Title>
              <Typography.Paragraph className="card-switch-description">
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
          <div className="route-tile-panel">
            <Row gutter={[12, 12]}>
              {renderCard()}
            </Row>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '30px 0', marginTop: -100 }}>
        <div className="container">
          <PostFeed title="Ближайшие события" />
        </div>
      </section>
    </>
  )
}

export default Home



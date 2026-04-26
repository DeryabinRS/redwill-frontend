import { Card, Col, Row, Space, Typography } from 'antd'
import { ScheduleOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'
// import { useTranslation } from 'react-i18next'
import MapHeaderCanvas from '../components/MapHeaderCanvas/MapHeaderCanvas'
import PcbTracesAnimation from '../components/PcbTracesAnimation/PcbTracesAnimation'
import PostFeed from '../components/PostFeed'

function Home() {
  // const { t } = useTranslation()

  const cardData = [
    {title: 'События', desc: 'Календарь мото-мероприятий', icon: <ScheduleOutlined style={{ fontSize: 28 }} /> },
    {title: 'Мотоклубы', desc: 'Объединение мотоциклистов, основанное на общих интересах и философии', icon: <ShopOutlined style={{ fontSize: 28 }} /> },
    {title: 'Байк-посты, бары', desc: 'Точки тусовок, отдыха и развлечений', icon: <TeamOutlined style={{ fontSize: 28 }} /> },
    {title: 'СТО', desc: 'Станции технического обслуживания мото-техники', icon: <ToolOutlined style={{ fontSize: 28 }} /> },
  ];

  const renderCard = () => cardData.map(item => (
    <Col key={item.title} xs={24} lg={12} xl={6}>
      <div className="card-stripes" style={{ height: '100%' }}>
          <div className="stripe-bg"></div>
          <div className="stripe-border"></div>
          <div class="content">
            <Space.Compact size={12}>
                <div style={{ paddingRight: 12, paddingTop: 4, color: 'var(--theme-color)' }}>{item.icon}</div>
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {item.title}
                  </Typography.Title>
                  <Typography.Paragraph style={{ color: '#a1a1a1' }}>
                    {item.desc}
                  </Typography.Paragraph>
                </div>
            </Space.Compact>
          </div>
      </div>
    </Col>
  ));

  return (
    <>
      <section className="section section__header" style={{ padding: '8px 0' }}>
        <MapHeaderCanvas />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Row gutter={[16, 16]}>
            {renderCard()}
          </Row>
        </div>
      </section>

      <PcbTracesAnimation maxTraces={15}>
        <section className="section" style={{ padding: '30px 0' }}>
          <div className="container">
            <PostFeed title="Ближайшие события" />
          </div>
        </section>
      </PcbTracesAnimation>
    </>
  )
}

export default Home



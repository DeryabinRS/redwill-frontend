import { Card, Col, Row, Space, Typography } from 'antd'
import { ScheduleOutlined, ShopOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'
// import { useTranslation } from 'react-i18next'
import MapHeaderCanvas from '../components/MapHeaderCanvas/MapHeaderCanvas'
import PcbTracesAnimation from '../components/PcbTracesAnimation/PcbTracesAnimation'
import PostFeed from '../components/PostFeed'

function Home() {
  // const { t } = useTranslation()

  const cardData = [
    {title: 'События', desc: 'Календарь мото-мероприятий', icon: <ScheduleOutlined style={{ fontSize: 20 }} /> },
    {title: 'Мотоклубы', desc: 'Объединение мотоциклистов, основанное на общих интересах, философии', icon: <ShopOutlined style={{ fontSize: 20 }} /> },
    {title: 'Байк-посты, бары', desc: 'Точки тусовок, отдыха и развлечений', icon: <TeamOutlined style={{ fontSize: 20 }} /> },
    {title: 'Ремонтные мастерские', desc: 'Станции технического обслуживания мото-техники', icon: <ToolOutlined style={{ fontSize: 20 }} /> },
  ];

  const renderCard = () => cardData.map(item => (
    <Col key={item.title} xs={24} md={8}>
      <Card style={{ height: '100%', filter: 'opacity(0.95)' }}>
        <Space direction="vertical" size={12}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {item.icon} {item.title}
          </Typography.Title>
          <Typography.Paragraph>
            {item.desc}
          </Typography.Paragraph>
        </Space>
      </Card>
    </Col>
  ));

  return (
    <>
      <section className="section section__header" style={{ padding: '30px 0' }}>
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



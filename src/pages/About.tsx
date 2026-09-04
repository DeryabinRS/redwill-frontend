import { Card, Col, Row, Space, Typography } from 'antd'
import { CoffeeOutlined, EnvironmentOutlined, MailOutlined, ScheduleOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'

const { Paragraph, Text, Title } = Typography

function About() {
  return (
    <section className="section" style={{ padding: '8px 0' }}>
      <div className="container">
        <div className="title_page">
          <div>
            <Text className="events-calendar-eyebrow">
              о проекте
            </Text>
            <Title level={1} className="events-calendar-title">
              MotoWing
            </Title>
            <Paragraph className="events-calendar-description">
              Платформа для мотосообщества, где можно находить события, клубы, места отдыха,
              полезные точки на маршрутах и сервисы для мотоциклов.
            </Paragraph>
          </div>
          <TeamOutlined className="title_page__icon" />
        </div>

        <Row gutter={[8, 8]}>
          <Col xs={24} lg={14}>
            <Card>
              <Title level={3}>Что такое MotoWing</Title>
              <Paragraph>
                MotoWing объединяет информацию, которая может быть полезна райдерам: календарь
                ближайших мероприятий, каталог мотоклубов, мото-баров, мото-постов и СТО.
                Проект помогает быстрее находить проверенные места, планировать поездки и
                поддерживать связь внутри мотосообщества.
              </Paragraph>
              <Paragraph>
                Пользователи могут добавлять новые события и объекты, а администрация проверяет
                публикации перед выводом в общие разделы. Такой подход помогает сохранять
                каталог актуальным и полезным.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card>
              <Title level={3}>Контакты</Title>
              <Space orientation="vertical" size="middle">
                <Space>
                  <MailOutlined />
                  <a href="mailto:deryabinrs@yandex.ru">deryabinrs@yandex.ru</a>
                </Space>
                <Text type="secondary">
                  По вопросам проекта, сотрудничества и предложений по развитию.
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Space orientation="vertical">
                <ScheduleOutlined style={{ fontSize: 28 }} />
                <Title level={4}>События</Title>
                <Text type="secondary">Календарь ближайших мероприятий мотосообщества.</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Space orientation="vertical">
                <TeamOutlined style={{ fontSize: 28 }} />
                <Title level={4}>Мотоклубы</Title>
                <Text type="secondary">Каталог клубов и объединений райдеров.</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Space orientation="vertical">
                <CoffeeOutlined style={{ fontSize: 28 }} />
                <Title level={4}>Мото-бары</Title>
                <Text type="secondary">Места встреч, отдыха и общения.</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Space orientation="vertical">
                <ToolOutlined style={{ fontSize: 28 }} />
                <Title level={4}>СТО и точки</Title>
                <Text type="secondary">Сервисы, мото-посты и полезные места на карте.</Text>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 8 }}>
          <Space orientation="vertical" size="middle">
            <Space>
              <EnvironmentOutlined />
              <Title level={3} style={{ margin: 0 }}>Идея проекта</Title>
            </Space>
            <Paragraph style={{ marginBottom: 0 }}>
              Сделать единую удобную точку входа для райдеров: посмотреть, что происходит рядом,
              найти клуб или место, добавить полезный объект и поделиться информацией с другими.
            </Paragraph>
          </Space>
        </Card>
      </div>
    </section>
  )
}

export default About

import { Card, Col, Divider, Row, Space, Typography } from 'antd'
import { CoffeeOutlined, EnvironmentOutlined, MailOutlined, ScheduleOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons'
import { Shell, ShellHeader, ShellSection } from '@components/Shell'
import Seo from '@components/Seo'

const { Paragraph, Text, Title } = Typography

function About() {
  return (
    <section className="section" style={{ padding: '8px 0' }}>
      <Seo
        title="О проекте"
        description="MotoWing — платформа для мотосообщества: события, мотоклубы, мото-бары, мото-посты и СТО."
        path="/about"
      />
      <div className="container">
        <Shell>
          <ShellHeader
            eyebrow="о проекте"
            title="MotoWing"
            subtitle="Платформа для мотосообщества, где можно находить события, клубы, места отдыха, полезные точки на маршрутах и сервисы для мотоциклов."
            actions={<span className="shell__chip shell__chip--accent"><TeamOutlined /></span>}
          />

          <ShellSection label="о проекте">
            <Row gutter={[8, 8]} align="stretch">
              <Col xs={24} lg={14}>
                <Card style={{ height: '100%' }}>
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
                <Card style={{ height: '100%' }}>
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

                  <Divider style={{ margin: '16px 0' }} />

                  <Title level={4} style={{ marginTop: 0 }}>Поддержи проект</Title>
                  <Space size="small" wrap>
                    <img src="/img/tbank.webp" alt="Т-Банк" style={{ height: 30, borderRadius: 8 }} />
                    <img src="/img/sberbank.webp" alt="Сбербанк" style={{ height: 30, borderRadius: 8 }} />
                  </Space>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    <a href="tel:+79234323303">+7 (923) 432 33 03</a> — Дерябин Роман
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            <Row gutter={[8, 8]} style={{ marginTop: 8 }} align="stretch">
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%' }}>
                  <Space orientation="vertical">
                    <ScheduleOutlined style={{ fontSize: 28 }} />
                    <Title level={4}>События</Title>
                    <Text type="secondary">Календарь ближайших мероприятий мотосообщества.</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%' }}>
                  <Space orientation="vertical">
                    <TeamOutlined style={{ fontSize: 28 }} />
                    <Title level={4}>Мотоклубы</Title>
                    <Text type="secondary">Каталог клубов и объединений райдеров.</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%' }}>
                  <Space orientation="vertical">
                    <CoffeeOutlined style={{ fontSize: 28 }} />
                    <Title level={4}>Мото-бары</Title>
                    <Text type="secondary">Места встреч, отдыха и общения.</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%' }}>
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
          </ShellSection>
        </Shell>
      </div>
    </section>
  )
}

export default About

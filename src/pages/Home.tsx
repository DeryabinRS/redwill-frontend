import { Button, Card, Col, Row, Space, Typography } from 'antd'
import { RocketOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

function Home() {
  const { t } = useTranslation()

  return (
    <div>
      <div className="container">
        <div className='header'>
        <Space direction="vertical" size={24} style={{ width: '100%', alignItems: 'center' }}>
          <Typography.Title style={{ textAlign: 'center', marginBottom: 0 }}>
            {t('hero.title')}
          </Typography.Title>
          <Typography.Paragraph style={{ textAlign: 'center', maxWidth: 720, fontSize: 16, opacity: 0.9 }}>
            {t('hero.subtitle')}
          </Typography.Paragraph>
          <Space size="middle" wrap>
            <Button type="primary" size="large">
              {t('hero.tryFree')}
            </Button>
          </Space>
        </Space>
        </div>
      </div>
  

      {/* Key Channels */}
      <section className="section">
        <div className="container">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card style={{ height: '100%' }}>
                <Space direction="vertical" size={12}>
                  <ShopOutlined style={{ fontSize: 28 }} />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Интернет-магазин
                  </Typography.Title>
                  <Typography.Paragraph>
                    Выберите шаблон и получите готовый сайт за 15 минут
                  </Typography.Paragraph>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ height: '100%' }}>
                <Space direction="vertical" size={12}>
                  <RocketOutlined style={{ fontSize: 28 }} />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Маркетплейсы
                  </Typography.Title>
                  <Typography.Paragraph>
                    Продавайте в режиме одного окна на популярных площадках
                  </Typography.Paragraph>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ height: '100%' }}>
                <Space direction="vertical" size={12}>
                  <TeamOutlined style={{ fontSize: 28 }} />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Соцсети и мессенджеры
                  </Typography.Title>
                  <Typography.Paragraph>
                    Ведите диалоги и выгружайте товары во все каналы
                  </Typography.Paragraph>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default Home



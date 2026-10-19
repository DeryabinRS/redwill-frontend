import { useState, useEffect } from 'react'
import { Layout, Menu, Typography, Drawer, Button, Badge } from 'antd'
import { 
  DashboardOutlined, 
  CoffeeOutlined,
  MenuOutlined, 
  UserOutlined, 
  FileTextOutlined,
  ShopOutlined,
  TeamOutlined,
  ToolOutlined,
  SettingOutlined,
  LogoutOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAuthenticated, removeAuthToken } from '../utils/auth'
import { useGetUserInfoQuery } from '../features/user/userSlice'
import { useGetModerationCountQuery } from '../features/dashboard/dashboardSlice'
import { useAppDispatch } from '../store/hooks'
import { resetClientState } from '../store'
// import LanguageSwitcher from '../components/LanguageSwitcher'
// import ThemeSwitcher from '../components/ThemeSwitcher'
import { SITE_NAME } from '../config/constants'

const { Header, Sider, Content, Footer } = Layout

function DashboardLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const userIsAuthenticated = isAuthenticated()
  useGetUserInfoQuery(undefined, { skip: !userIsAuthenticated })
  const { data: moderationCounts } = useGetModerationCountQuery()
  const pendingCounts = moderationCounts?.items ?? {
    posts: 0,
    motoclubs: 0,
    motobars: 0,
    moto_posts: 0,
    service_stations: 0,
  }

  // Определение мобильного экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    removeAuthToken()
    resetClientState(dispatch)
    navigate('/login')
  }

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <NavLink to="/dashboard" onClick={handleMenuClick}>Dashboard</NavLink>,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <NavLink to="/dashboard/users" onClick={handleMenuClick}>Пользователи</NavLink>,
    },
    {
      key: 'posts',
      icon: <FileTextOutlined />,
      label: (
        <Badge count={pendingCounts.posts} offset={[8, 0]} size="small">
          <NavLink to="/dashboard/posts" onClick={handleMenuClick}>События</NavLink>
        </Badge>
      ),
    },
    {
      key: 'motoclubs',
      icon: <TeamOutlined />,
      label: (
        <Badge count={pendingCounts.motoclubs} offset={[8, 0]} size="small">
          <NavLink to="/dashboard/motoclubs" onClick={handleMenuClick}>Мотоклубы</NavLink>
        </Badge>
      ),
    },
    {
      key: 'motobars',
      icon: <CoffeeOutlined />,
      label: (
        <Badge count={pendingCounts.motobars} offset={[8, 0]} size="small">
          <NavLink to="/dashboard/motobars" onClick={handleMenuClick}>Мотобары</NavLink>
        </Badge>
      ),
    },
    {
      key: 'moto-posts',
      icon: <ShopOutlined />,
      label: (
        <Badge count={pendingCounts.moto_posts} offset={[8, 0]} size="small">
          <NavLink to="/dashboard/moto-posts" onClick={handleMenuClick}>Байк-посты</NavLink>
        </Badge>
      ),
    },
    {
      key: 'service-stations',
      icon: <ToolOutlined />,
      label: (
        <Badge count={pendingCounts.service_stations} offset={[8, 0]} size="small">
          <NavLink to="/dashboard/service-stations" onClick={handleMenuClick}>СТО</NavLink>
        </Badge>
      ),
    },
    {
      key: 'messages',
      icon: <MailOutlined />,
      label: <NavLink to="/dashboard/messages" onClick={handleMenuClick}>Сообщения</NavLink>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <NavLink to="/dashboard/settings" onClick={handleMenuClick}>Настройки</NavLink>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('menu.logout'),
      danger: true,
      onClick: () => {
        handleMenuClick()
        handleLogout()
      },
    },
  ]

  // Мобильное меню - Drawer
  const mobileMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      style={{ borderRight: 0, marginTop: 16 }}
    />
  )

  const renderLogo = () => (
    <Link to="/">
      <Typography.Title level={2} style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img width={50} src='/img/logo.svg' /> 
          {/* <div style={{ borderBottom: '4px solid #cd2e2c' }}>{SITE_NAME}</div> */}
        </div>
      </Typography.Title>
    </Link>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop: Sider - скрывается на экранах меньше lg */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth={0}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
          }}
        >
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            {renderLogo()}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>
      )}

      {/* Mobile: Drawer */}
      {isMobile && (
        <Drawer
          title={renderLogo()}
          placement="left"
          onClose={() => setDrawerOpen(false)}
          closable={false}
          open={drawerOpen}
          width={250}
          styles={{
            body: { padding: 0, },
            header: { borderBottom: '1px solid rgba(255,255,255,0.1)' },
          }}
        >
          {mobileMenu}
        </Drawer>
      )}
      
      <Layout style={{ marginLeft: !isMobile && collapsed ? 0 : !isMobile ? 250 : 0, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button 
              type="text" 
              icon={<MenuOutlined />}
              onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Панель администратора
            </Typography.Title>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* <ThemeSwitcher />
            <LanguageSwitcher /> */}
          </div>
        </Header>
        
        <Content style={{ margin: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
        
        <Footer style={{ textAlign: 'center' }}>
          {SITE_NAME} Admin © {new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout

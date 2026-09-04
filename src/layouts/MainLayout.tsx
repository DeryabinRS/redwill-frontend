import { useState } from 'react'
import { Button, Drawer, Grid, Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
	DashboardOutlined,
	LoginOutlined,
	LogoutOutlined,
	MenuOutlined,
	MoreOutlined,
	OrderedListOutlined,
	PlusOutlined,
	UserAddOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAuthenticated, removeAuthToken } from '../utils/auth'
import { useGetUserInfoQuery } from '../features/user/userSlice'
import { useAppDispatch } from '../store/hooks'
import { resetClientState } from '../store'
import { SITE_NAME } from '../config/constants'
// import LanguageSwitcher from '../components/LanguageSwitcher'
// import ThemeSwitcher from '../components/ThemeSwitcher'

const { Header, Content, Footer } = Layout
const { useBreakpoint } = Grid

type MenuItem = Required<MenuProps>['items'][number]

function MainLayout() {
	const { t } = useTranslation()
	const screens = useBreakpoint()
	const isLgUp = !!screens.lg
	const [drawerOpen, setDrawerOpen] = useState(false)
	const userIsAuthenticated = isAuthenticated()

	const {
		data: userInfo,
		isLoading: isLoadingUserInfo,
	} = useGetUserInfoQuery(undefined, { skip: !userIsAuthenticated })
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const handleLogout = () => {
		removeAuthToken()
		resetClientState(dispatch)
		navigate('/login')
	}

	const closeDrawer = () => setDrawerOpen(false)

	const hasAdminRole = userInfo?.roles.includes('admin') || userInfo?.roles.includes('editor')

	const menuItems: MenuItem[] = [
		{
			key: 'about',
			label: <NavLink to="/about" onClick={closeDrawer}>О проекте</NavLink>,
		},
		{
			key: 'add',
			icon: <PlusOutlined />,
			label: 'Добавить',
			children: [
				{
					key: 'create-post',
					label: <NavLink to="/posts/create" onClick={closeDrawer}>Событие</NavLink>,
				},
				{
					key: 'create-motoclub',
					label: <NavLink to="/motoclubs/create" onClick={closeDrawer}>Мотоклуб</NavLink>,
				},
				{
					key: 'create-motobar',
					label: <NavLink to="/motobars/create" onClick={closeDrawer}>Мотобар</NavLink>,
				},
				{
					key: 'create-moto-post',
					label: <NavLink to="/moto-posts/create" onClick={closeDrawer}>Мото-пост</NavLink>,
				},
				{
					key: 'create-service-station',
					label: <NavLink to="/service-stations/create" onClick={closeDrawer}>СТО</NavLink>,
				},
			],
		},
	]

	if (hasAdminRole) {
		menuItems.push({
			key: 'dashboard',
			icon: <DashboardOutlined />,
			label: <NavLink to="/dashboard" onClick={closeDrawer}>Dashboard</NavLink>,
		})
	}

	const authItems: MenuItem[] = (userIsAuthenticated && userInfo)
		? [
			{
				key: 'profile',
				icon: <UserOutlined />,
				label: <NavLink to="/profile">{userInfo.login}</NavLink>,
			},
			{
				key: 'logout',
				icon: <LogoutOutlined />,
				label: t('menu.logout'),
				onClick: handleLogout,
			},
		]
		: [
			{
				key: 'login',
				icon: <LoginOutlined />,
				label: <NavLink to="/login">{t('menu.login')}</NavLink>,
			},
			{
				key: 'register',
				icon: <UserAddOutlined />,
				label: <NavLink to="/register">{t('menu.register')}</NavLink>,
			},
		]

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header style={{ padding: 0, height: '100%', borderBottom: '1px solid #2f2e2e' }}>
				<div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
					<Typography.Title level={2} style={{ margin: '6px 0', flexShrink: 0 }}>
						<Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<img width={80} src="/img/logo.png" alt={SITE_NAME} />
							</div>
						</Link>
					</Typography.Title>

					{!isLgUp && (
						<Button
							type="text"
							icon={<MenuOutlined />}
							aria-label="Меню"
							onClick={() => setDrawerOpen(true)}
						/>
					)}

					{isLgUp && (
						<Menu
							mode="horizontal"
							selectable={false}
							style={{ flex: 1, minWidth: 0 }}
							overflowedIndicator={<OrderedListOutlined />}
							items={menuItems}
						/>
					)}

					{!isLoadingUserInfo && (
						<Menu
							mode="horizontal"
							selectable={false}
							style={{ flex: 1, minWidth: 0, justifyContent: 'end' }}
							overflowedIndicator={<MoreOutlined />}
							items={authItems}
						/>
					)}
					{/* <ThemeSwitcher />
					<LanguageSwitcher /> */}
				</div>
			</Header>

			{!isLgUp && (
				<Drawer
					title="Меню"
					placement="left"
					open={drawerOpen}
					onClose={closeDrawer}
					styles={{ body: { padding: 0 } }}
				>
					<Menu
						mode="inline"
						selectable={false}
						style={{ borderInlineEnd: 'none' }}
						items={menuItems}
					/>
				</Drawer>
			)}

			<Content>
				<Outlet />
			</Content>
			<Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} {SITE_NAME}</Footer>
		</Layout>
	)
}

export default MainLayout

import { Grid, Layout, Menu, Typography } from 'antd'
import { DashboardOutlined, LoginOutlined, LogoutOutlined, MoreOutlined, OrderedListOutlined, PlusOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAuthenticated, removeAuthToken } from '../utils/auth'
import { useGetUserInfoQuery, userApi } from '../features/user/userSlice'
import { useAppDispatch } from '../store/hooks'
import { SITE_NAME } from '../config/constants'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeSwitcher from '../components/ThemeSwitcher'

const { Header, Content, Footer } = Layout

const { useBreakpoint } = Grid;

function MainLayout() {
	const { t } = useTranslation()
	const userIsAuthenticated = isAuthenticated()
	const { md } = useBreakpoint()

	const { 
		data: userInfo, 
		isLoading: isLoadingUserInfo,
	} = useGetUserInfoQuery(undefined, { skip: !userIsAuthenticated })
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const handleLogout = () => {
		removeAuthToken()
		dispatch(userApi.util.resetApiState())
		navigate('/login')
	}

	const hasAdminRole = userInfo?.roles.includes('admin') || userInfo?.roles.includes('editor')

	const menuItems = [
		// {
		// 	key: 'home',
		// 	icon: <HomeOutlined />,
		// 	label: <NavLink to="/">{t('menu.home')}</NavLink>,
		// },
	]

	// Добавляем Dashboard для admin/editor
	if (hasAdminRole) {
		menuItems.push({
			key: 'dashboard',
			icon: <DashboardOutlined />,
			label: <NavLink to="/dashboard">Dashboard</NavLink>,
		})
	}

	// Добавляем "Создать пост" для авторизованных пользователей
	if (userIsAuthenticated) {
		menuItems.push({
			key: 'create-post',
			icon: <PlusOutlined />,
			label: <NavLink to="/posts/create">Создать пост</NavLink>,
		})
	}

	const authItems = (userIsAuthenticated && userInfo)
		? [
			{
				key: 'profile',
				icon: <UserOutlined />,
				label: <NavLink to="/profile">{userInfo.first_name}</NavLink>,
			},
			{
				key: 'logout',
				icon: <LogoutOutlined />,
				label: t('menu.logout'),
				onClick: handleLogout,
			},
		] : [
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
			<Header style={{ padding: 0, height: '100%' }}>
				<div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%' }}>
					<Typography.Title level={2} style={{ margin: 0 }}>
							<Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<img width={80} src='/public/logo.svg' /> 
									{md && <div style={{ borderBottom: '4px solid #cd2e2c' }}>{SITE_NAME}</div>}
								</div>
							</Link>
					</Typography.Title>
					<Menu
						mode="horizontal"
						selectable={false}
						style={{ flex: 1, minWidth: 0 }}
						overflowedIndicator={<OrderedListOutlined/>}
						items={menuItems}
					/>
					{!isLoadingUserInfo && (
						<Menu
						mode="horizontal"
						selectable={false}
						style={{ flex: 1, minWidth: 0, justifyContent: 'end' }}
						overflowedIndicator={<MoreOutlined />}
						items={authItems}
					/>
					)}
					<ThemeSwitcher />
					<LanguageSwitcher />
				</div>
			</Header>
			<Content>
				<Outlet />
			</Content>
			<Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} {SITE_NAME}</Footer>
		</Layout>
	)
}

export default MainLayout



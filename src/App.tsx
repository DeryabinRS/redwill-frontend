import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ConfigProvider } from 'antd'

import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AppInitializer from './components/AppInitializer'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import VerifyEmail from './pages/Auth/VerifyEmail'
import ResendVerification from './pages/Auth/ResendVerification'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Profile from './pages/User/Profile'
import Dashboard from './pages/Dashboard'
import Users from './pages/Dashboard/Users/Users'
import User from './pages/Dashboard/Users/User'
import AddPost from './pages/Posts/AddPost'
import Post from './pages/Posts/Post'
import DashboardPosts from './pages/Dashboard/Posts/Posts'
import DashboardAddPost from './pages/Dashboard/Posts/AddPost'
import DashboardUpdatePost from './pages/Dashboard/Posts/EditPost'

import { ThemeProvider, useTheme } from './contexts/ThemeContext'

import './App.css'

function AppContent() {
  const { antThemeConfig } = useTheme()
  
  return (
    <ConfigProvider theme={antThemeConfig}>
      <AppInitializer>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Profile />} />
              <Route path="posts/:post/edit" element={<DashboardUpdatePost />} />
            </Route>
            <Route
              path="/posts/create"
              element={
                <ProtectedRoute>
                  <AddPost />
                </ProtectedRoute>
              }
            />
            <Route path="/posts/:post" element={<Post />} />
          </Route>
          
          {/* Dashboard с боковым меню */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<User />} />
            <Route path="posts" element={<DashboardPosts />} />
            <Route path="posts/create" element={<DashboardAddPost />} />
            <Route path="posts/:post/edit" element={<DashboardUpdatePost />} />
            <Route path="posts/:post" element={<DashboardUpdatePost />} />
            <Route path="orders" element={<div>Заказы</div>} />
            <Route path="settings" element={<div>Настройки</div>} />
          </Route>
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInitializer>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App

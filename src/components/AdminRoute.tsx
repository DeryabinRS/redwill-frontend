import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useGetUserInfoQuery } from '../features/user/userSlice'
import { Spin } from 'antd'

type AdminRouteProps = {
  children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation()
  const { data: userInfo, isLoading } = useGetUserInfoQuery()

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!userInfo) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const hasAdminRole = userInfo.roles.includes('admin') || userInfo.roles.includes('editor')

  if (!hasAdminRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AdminRoute

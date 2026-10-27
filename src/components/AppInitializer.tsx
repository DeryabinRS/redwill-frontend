import { useEffect } from 'react'
import { useLazyGetUserInfoQuery } from '../features/user/userSlice'
import { isAuthenticated, handleAuthError } from '../utils/auth'
import { usePushNotifications } from '../hooks/usePushNotifications'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [getUserInfo] = useLazyGetUserInfoQuery()
  usePushNotifications()

  useEffect(() => {
    if (isAuthenticated()) {
      getUserInfo()
        .unwrap()
        .catch((error) => {
          if (error?.status === 401) {
            handleAuthError()
          }
        })
    }
  }, [getUserInfo])

  return <>{children}</>
}

export default AppInitializer

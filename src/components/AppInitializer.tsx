import { useEffect } from 'react'
import { useLazyGetUserInfoQuery, handleAuthError } from '../features/user/userSlice'
import { isAuthenticated } from '../utils/auth'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [getUserInfo] = useLazyGetUserInfoQuery()

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

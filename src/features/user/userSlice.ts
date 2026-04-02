import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAuthToken, removeAuthToken } from '../../utils/auth'
import { API_URL } from '../../config/constants'

export type UserInfo = {
  id: number
  last_name: string
  first_name: string
  email: string
  roles: string[]
}

type GetUserInfoResponse = {
  data: UserInfo
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL || '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getAuthToken()

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      query: () => ({ url: '/user/info', method: 'GET' }),
      transformResponse: (response: GetUserInfoResponse) => response.data,
    }),
  }),
})

// Хелпер для обработки ошибок — вызывается при 401
export function handleAuthError() {
  removeAuthToken()
  window.location.href = '/login'
}

export const { useGetUserInfoQuery, useLazyGetUserInfoQuery } = userApi

import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { API_URL } from '../config/constants'
import { getAuthToken, handleAuthError } from '../utils/auth'

/**
 * Общий baseQuery для всех RTK Query API.
 * - baseUrl из конфига (API_URL или '/api')
 * - credentials: 'include' (cookie-сессия)
 * - автоматическая подстановка Bearer-токена из cookie
 * - централизованный выход при 401
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL || '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = getAuthToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    handleAuthError()
  }

  return result
}

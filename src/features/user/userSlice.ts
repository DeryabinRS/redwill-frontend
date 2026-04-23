import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAuthToken, removeAuthToken } from '../../utils/auth'
import { API_URL } from '../../config/constants'

export type PaginationLink = {
  active: boolean
  label: string
  page: number
  url: string
}

export type Pagination = {
  current_page: number
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string
  path: string
  per_page: number
  prev_page_url: string
  to: number
  total: number
}

export type UserInfo = {
  id: number
  last_name: string
  first_name: string
  middle_name: string
  login: string
  email: string
  roles: string[]
  created_at?: string
  updated_at?: string
  verified_at?: string
}

type GetUserInfoResponse = {
  data: UserInfo
}

export type UsersListResponse = {
  data: UserInfo[]
} & Pagination

type GetAllUsersResponse = {
  data_user_list: UsersListResponse
}

type GetUserResponse = {
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
    getAllUsers: builder.query<UsersListResponse, void>({
      query: () => ({ url: '/users', method: 'GET' }),
      transformResponse: (response: GetAllUsersResponse) => response.data_user_list,
    }),
    getUser: builder.query<UserInfo, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'GET' }),
      transformResponse: (response: GetUserResponse) => response.data,
    }),
  }),
})

// Хелпер для обработки ошибок — вызывается при 401
export function handleAuthError() {
  removeAuthToken()
  window.location.href = '/login'
}

export const { 
  useGetUserInfoQuery, 
  useLazyGetUserInfoQuery,
  useGetAllUsersQuery,
  useLazyGetAllUsersQuery,
  useGetUserQuery,
  useLazyGetUserQuery,
} = userApi

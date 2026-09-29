import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

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
  last_name: string | null
  first_name: string | null
  middle_name?: string | null
  nick_name?: string | null
  city?: string | null
  phone?: string | null
  birthday?: string | null
  accommodation?: number | null
  login: string
  email: string
  avatar?: string | null
  baned: number
  roles: string[]
  created_at?: string
  updated_at?: string
  verified_at?: string
}

export type PublicUserInfo = {
  id: number
  login: string
  first_name: string | null
  last_name: string | null
  nick_name: string | null
  city: string | null
  phone: string | null
  birthday: string | null
  accommodation: number | null
  avatar: string | null
  roles: string[]
  is_friend: boolean
  friends_count?: number
}

export type UpdateUserProfilePayload = {
  first_name?: string | null
  last_name?: string | null
  nick_name?: string | null
  city?: string | null
  phone?: string | null
  birthday?: string | null
  accommodation?: number | null
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
  tagTypes: ['Users', 'User'],
  baseQuery,
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      query: () => ({ url: '/user/info', method: 'GET' }),
      transformResponse: (response: GetUserInfoResponse) => response.data,
      providesTags: ['User'],
    }),
    uploadUserAvatar: builder.mutation<{ id: number; avatar: string | null }, FormData>({
      query: (payload) => ({
        url: '/user/avatar',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: { data: { id: number; avatar: string | null } }) => response.data,
      invalidatesTags: ['User'],
    }),
    deleteUserAvatar: builder.mutation<{ id: number; avatar: string | null }, void>({
      query: () => ({
        url: '/user/avatar',
        method: 'DELETE',
      }),
      transformResponse: (response: { data: { id: number; avatar: string | null } }) => response.data,
      invalidatesTags: ['User'],
    }),
    updateUserProfile: builder.mutation<UpdateUserProfilePayload & { id: number }, UpdateUserProfilePayload>({
      query: (payload) => ({
        url: '/user/profile',
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: { data: UpdateUserProfilePayload & { id: number } }) => response.data,
      invalidatesTags: ['User'],
    }),
    getPublicUserProfile: builder.query<PublicUserInfo, number>({
      query: (id) => ({ url: `/users/${id}/profile`, method: 'GET' }),
      transformResponse: (response: { data: PublicUserInfo }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    getAllUsers: builder.query<UsersListResponse, void>({
      query: () => ({ url: '/users', method: 'GET' }),
      transformResponse: (response: GetAllUsersResponse) => response.data_user_list,
      providesTags: ['Users'],
    }),
    getUser: builder.query<UserInfo, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'GET' }),
      transformResponse: (response: GetUserResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    updateUserBaned: builder.mutation<{ id: number; baned: number }, { id: number; baned: number }>({
      query: ({ id, baned }) => ({
        url: `/users/${id}/baned`,
        method: 'PATCH',
        body: { baned },
      }),
      transformResponse: (response: { data: { id: number; baned: number } }) => response.data,
      invalidatesTags: (_result, _error, { id }) => ['Users', { type: 'User', id }],
    }),
  }),
})

export const { 
  useGetUserInfoQuery, 
  useLazyGetUserInfoQuery,
  useGetAllUsersQuery,
  useLazyGetAllUsersQuery,
  useGetUserQuery,
  useLazyGetUserQuery,
  useGetPublicUserProfileQuery,
  useUpdateUserBanedMutation,
  useUploadUserAvatarMutation,
  useDeleteUserAvatarMutation,
  useUpdateUserProfileMutation,
} = userApi

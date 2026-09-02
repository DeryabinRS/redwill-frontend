import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../config/constants'
import { getAuthToken } from '../../utils/auth'

export type MotoclubMember = {
  id: number
  login: string
  avatar: string | null
}

export type MotoclubManagedMember = MotoclubMember & {
  email: string
  verified: string | null
  joined_at: string
  is_admin: number
  is_owner: boolean
}

export type MotoclubMembersResponse = {
  motoclub: {
    id: number
    name: string
    user_id: number
  }
  members: MotoclubManagedMember[]
}

export type Motoclub = {
  id: number
  user_id?: number
  parent_id: number | null
  name: string
  desc: string | null
  birthday: string | null
  logo: string | null
  website: string | null
  social_link: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  location: string | null
  moderation_status: number
  publication_status: number
  created_at: string
  updated_at: string
  parent?: Pick<Motoclub, 'id' | 'name' | 'logo'> | null
  children?: Pick<Motoclub, 'id' | 'name' | 'logo' | 'parent_id'>[]
  members?: MotoclubMember[]
  verified_members_count?: number
  pending_members_count?: number
  members_count?: number
  admins_count?: number
  pivot?: {
    user_id?: number
    motoclub_id?: number
    verified?: string | null
    is_admin?: number
    created_at?: string
    updated_at?: string
  }
}

type CreateMotoclubResponse = {
  data: Motoclub
}

type MotoclubListResponse = {
  data: Motoclub[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  next_page_url: string | null
  prev_page_url: string | null
}

type GetMotoclubListArgs = {
  pagination?: { page?: number; per_page?: number }
  search?: string
}

export const motoclubApi = createApi({
  reducerPath: 'motoclubApi',
  tagTypes: ['Motoclubs', 'Motoclub', 'JoinedMotoclubs', 'MotoclubMembers'],
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
    getMotoclub: builder.query<Motoclub, string | number>({
      query: (motoclub) => ({
        url: `/motoclubs/${motoclub}`,
        method: 'GET',
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      providesTags: (_result, _error, motoclub) => [{ type: 'Motoclub', id: motoclub }],
    }),
    getMotoclubList: builder.query<MotoclubListResponse, GetMotoclubListArgs | void>({
      query: (args) => ({
        url: '/motoclubs',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page,
          search: args?.search?.trim() || undefined,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoclubListResponse
      }) => response.data,
      providesTags: ['Motoclubs'],
    }),
    getUserMotoclubs: builder.query<MotoclubListResponse, GetMotoclubListArgs | void>({
      query: (args) => ({
        url: '/user/motoclubs',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoclubListResponse
      }) => response.data,
      providesTags: ['Motoclubs'],
    }),
    getUserMotoclub: builder.query<Motoclub, string | number>({
      query: (motoclub) => ({
        url: `/user/motoclubs/${motoclub}`,
        method: 'GET',
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      providesTags: (_result, _error, motoclub) => [{ type: 'Motoclub', id: motoclub }],
    }),
    getJoinedMotoclubs: builder.query<MotoclubListResponse, GetMotoclubListArgs | void>({
      query: (args) => ({
        url: '/user/joined-motoclubs',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoclubListResponse
      }) => response.data,
      providesTags: ['JoinedMotoclubs'],
    }),
    joinMotoclub: builder.mutation<Motoclub, string | number>({
      query: (motoclub) => ({
        url: `/motoclubs/${motoclub}/join`,
        method: 'POST',
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      invalidatesTags: (_result, _error, motoclub) => [
        'JoinedMotoclubs',
        { type: 'Motoclub', id: motoclub },
      ],
    }),
    leaveMotoclub: builder.mutation<void, string | number>({
      query: (motoclub) => ({
        url: `/motoclubs/${motoclub}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, motoclub) => [
        'Motoclubs',
        'JoinedMotoclubs',
        { type: 'Motoclub', id: motoclub },
      ],
    }),
    getMotoclubMembers: builder.query<MotoclubMembersResponse, string | number>({
      query: (motoclub) => ({
        url: `/motoclubs/${motoclub}/members`,
        method: 'GET',
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoclubMembersResponse
      }) => response.data,
      providesTags: (_result, _error, motoclub) => [{ type: 'MotoclubMembers', id: motoclub }],
    }),
    updateMotoclubMember: builder.mutation<
      void,
      {
        motoclub: string | number
        userId: number
        status?: 'pending' | 'member'
        is_admin?: 0 | 1
      }
    >({
      query: ({ motoclub, userId, status, is_admin }) => ({
        url: `/motoclubs/${motoclub}/members/${userId}`,
        method: 'PATCH',
        body: {
          ...(status !== undefined ? { status } : {}),
          ...(is_admin !== undefined ? { is_admin } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { motoclub }) => [
        'Motoclubs',
        'JoinedMotoclubs',
        { type: 'MotoclubMembers', id: motoclub },
        { type: 'Motoclub', id: motoclub },
      ],
    }),
    removeMotoclubMember: builder.mutation<void, { motoclub: string | number; userId: number }>({
      query: ({ motoclub, userId }) => ({
        url: `/motoclubs/${motoclub}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { motoclub }) => [
        'Motoclubs',
        'JoinedMotoclubs',
        { type: 'MotoclubMembers', id: motoclub },
        { type: 'Motoclub', id: motoclub },
      ],
    }),
    getDashboardMotoclubList: builder.query<MotoclubListResponse, GetMotoclubListArgs | void>({
      query: (args) => ({
        url: '/dashboard/motoclubs',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoclubListResponse
      }) => response.data,
      providesTags: ['Motoclubs'],
    }),
    getDashboardMotoclub: builder.query<Motoclub, string | number>({
      query: (motoclub) => ({
        url: `/dashboard/motoclubs/${motoclub}`,
        method: 'GET',
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      providesTags: (_result, _error, motoclub) => [{ type: 'Motoclub', id: motoclub }],
    }),
    createMotoclub: builder.mutation<Motoclub, FormData>({
      query: (payload) => ({
        url: '/motoclubs',
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      invalidatesTags: ['Motoclubs', 'JoinedMotoclubs'],
    }),
    updateMotoclub: builder.mutation<Motoclub, { motoclub: string | number; payload: FormData }>({
      query: ({ motoclub, payload }) => ({
        url: `/motoclubs/${motoclub}`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      invalidatesTags: (_result, _error, { motoclub }) => [
        'Motoclubs',
        { type: 'Motoclub', id: motoclub },
      ],
    }),
    uploadMotoclubLogo: builder.mutation<Motoclub, { motoclub: string | number; payload: FormData }>({
      query: ({ motoclub, payload }) => ({
        url: `/motoclubs/${motoclub}/logo`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      invalidatesTags: (_result, _error, { motoclub }) => [
        'Motoclubs',
        { type: 'Motoclub', id: motoclub },
      ],
    }),
    deleteMotoclub: builder.mutation<void, string | number>({
      query: (motoclub) => ({
        url: `/motoclubs/${motoclub}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Motoclubs'],
    }),
  }),
})

export const {
  useCreateMotoclubMutation,
  useGetMotoclubQuery,
  useGetMotoclubListQuery,
  useGetUserMotoclubsQuery,
  useGetUserMotoclubQuery,
  useGetJoinedMotoclubsQuery,
  useJoinMotoclubMutation,
  useLeaveMotoclubMutation,
  useGetMotoclubMembersQuery,
  useUpdateMotoclubMemberMutation,
  useRemoveMotoclubMemberMutation,
  useGetDashboardMotoclubQuery,
  useUpdateMotoclubMutation,
  useUploadMotoclubLogoMutation,
  useDeleteMotoclubMutation,
} = motoclubApi

export const useGetDashboardMotoclubListQuery = motoclubApi.useGetDashboardMotoclubListQuery

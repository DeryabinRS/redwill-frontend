import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../config/constants'
import { getAuthToken } from '../../utils/auth'

export type MotoPost = {
  id: number
  name: string
  desc: string | null
  website: string | null
  logo: string | null
  address: string | null
  location: string | null
  phone: string | null
  moderation_status: number
  publication_status: number
  created_at: string
  updated_at: string
}

type MotoPostResponse = {
  data: MotoPost
}

type MotoPostListResponse = {
  data: MotoPost[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  next_page_url: string | null
  prev_page_url: string | null
}

type GetMotoPostListArgs = {
  pagination?: { page?: number; per_page?: number }
}

export const motoPostApi = createApi({
  reducerPath: 'motoPostApi',
  tagTypes: ['MotoPosts', 'MotoPost'],
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
    getMotoPost: builder.query<MotoPost, string | number>({
      query: (motoPost) => ({
        url: `/moto-posts/${motoPost}`,
        method: 'GET',
      }),
      transformResponse: (response: MotoPostResponse) => response.data,
      providesTags: (_result, _error, motoPost) => [{ type: 'MotoPost', id: motoPost }],
    }),
    getMotoPostList: builder.query<MotoPostListResponse, GetMotoPostListArgs | void>({
      query: (args) => ({
        url: '/moto-posts',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 40,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoPostListResponse
      }) => response.data,
      providesTags: ['MotoPosts'],
    }),
    getUserMotoPosts: builder.query<MotoPostListResponse, GetMotoPostListArgs | void>({
      query: (args) => ({
        url: '/user/moto-posts',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoPostListResponse
      }) => response.data,
      providesTags: ['MotoPosts'],
    }),
    getDashboardMotoPostList: builder.query<MotoPostListResponse, GetMotoPostListArgs | void>({
      query: (args) => ({
        url: '/dashboard/moto-posts',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotoPostListResponse
      }) => response.data,
      providesTags: ['MotoPosts'],
    }),
    getDashboardMotoPost: builder.query<MotoPost, string | number>({
      query: (motoPost) => ({
        url: `/dashboard/moto-posts/${motoPost}`,
        method: 'GET',
      }),
      transformResponse: (response: MotoPostResponse) => response.data,
      providesTags: (_result, _error, motoPost) => [{ type: 'MotoPost', id: motoPost }],
    }),
    createMotoPost: builder.mutation<MotoPost, FormData>({
      query: (payload) => ({
        url: '/moto-posts',
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: MotoPostResponse) => response.data,
      invalidatesTags: ['MotoPosts'],
    }),
    updateMotoPost: builder.mutation<MotoPost, { motoPost: string | number; payload: FormData }>({
      query: ({ motoPost, payload }) => ({
        url: `/moto-posts/${motoPost}`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: MotoPostResponse) => response.data,
      invalidatesTags: (_result, _error, { motoPost }) => [
        'MotoPosts',
        { type: 'MotoPost', id: motoPost },
      ],
    }),
    uploadMotoPostLogo: builder.mutation<MotoPost, { motoPost: string | number; payload: FormData }>({
      query: ({ motoPost, payload }) => ({
        url: `/moto-posts/${motoPost}/logo`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: MotoPostResponse) => response.data,
      invalidatesTags: (_result, _error, { motoPost }) => [
        'MotoPosts',
        { type: 'MotoPost', id: motoPost },
      ],
    }),
    deleteMotoPost: builder.mutation<void, string | number>({
      query: (motoPost) => ({
        url: `/moto-posts/${motoPost}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MotoPosts'],
    }),
  }),
})

export const {
  useCreateMotoPostMutation,
  useGetMotoPostQuery,
  useGetMotoPostListQuery,
  useGetUserMotoPostsQuery,
  useGetDashboardMotoPostQuery,
  useGetDashboardMotoPostListQuery,
  useUpdateMotoPostMutation,
  useUploadMotoPostLogoMutation,
  useDeleteMotoPostMutation,
} = motoPostApi

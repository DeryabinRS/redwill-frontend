import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../config/constants'
import { getAuthToken } from '../../utils/auth'

export type Motobar = {
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

type CreateMotobarResponse = {
  data: Motobar
}

type MotobarListResponse = {
  data: Motobar[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  next_page_url: string | null
  prev_page_url: string | null
}

type GetMotobarListArgs = {
  pagination?: { page?: number; per_page?: number }
}

export const motobarApi = createApi({
  reducerPath: 'motobarApi',
  tagTypes: ['Motobars', 'Motobar'],
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
    getMotobar: builder.query<Motobar, string | number>({
      query: (motobar) => ({
        url: `/motobars/${motobar}`,
        method: 'GET',
      }),
      transformResponse: (response: CreateMotobarResponse) => response.data,
      providesTags: (_result, _error, motobar) => [{ type: 'Motobar', id: motobar }],
    }),
    getMotobarList: builder.query<MotobarListResponse, GetMotobarListArgs | void>({
      query: (args) => ({
        url: '/motobars',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 40,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotobarListResponse
      }) => response.data,
      providesTags: ['Motobars'],
    }),
    getUserMotobars: builder.query<MotobarListResponse, GetMotobarListArgs | void>({
      query: (args) => ({
        url: '/user/motobars',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotobarListResponse
      }) => response.data,
      providesTags: ['Motobars'],
    }),
    getDashboardMotobarList: builder.query<MotobarListResponse, GetMotobarListArgs | void>({
      query: (args) => ({
        url: '/dashboard/motobars',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: MotobarListResponse
      }) => response.data,
      providesTags: ['Motobars'],
    }),
    getDashboardMotobar: builder.query<Motobar, string | number>({
      query: (motobar) => ({
        url: `/dashboard/motobars/${motobar}`,
        method: 'GET',
      }),
      transformResponse: (response: CreateMotobarResponse) => response.data,
      providesTags: (_result, _error, motobar) => [{ type: 'Motobar', id: motobar }],
    }),
    createMotobar: builder.mutation<Motobar, FormData>({
      query: (payload) => ({
        url: '/motobars',
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotobarResponse) => response.data,
      invalidatesTags: ['Motobars'],
    }),
    updateMotobar: builder.mutation<Motobar, { motobar: string | number; payload: FormData }>({
      query: ({ motobar, payload }) => ({
        url: `/motobars/${motobar}`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotobarResponse) => response.data,
      invalidatesTags: (_result, _error, { motobar }) => [
        'Motobars',
        { type: 'Motobar', id: motobar },
      ],
    }),
    uploadMotobarLogo: builder.mutation<Motobar, { motobar: string | number; payload: FormData }>({
      query: ({ motobar, payload }) => ({
        url: `/motobars/${motobar}/logo`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotobarResponse) => response.data,
      invalidatesTags: (_result, _error, { motobar }) => [
        'Motobars',
        { type: 'Motobar', id: motobar },
      ],
    }),
    deleteMotobar: builder.mutation<void, string | number>({
      query: (motobar) => ({
        url: `/motobars/${motobar}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Motobars'],
    }),
  }),
})

export const {
  useCreateMotobarMutation,
  useGetMotobarQuery,
  useGetMotobarListQuery,
  useGetUserMotobarsQuery,
  useGetDashboardMotobarQuery,
  useUpdateMotobarMutation,
  useUploadMotobarLogoMutation,
  useDeleteMotobarMutation,
} = motobarApi

export const useGetDashboardMotobarListQuery = motobarApi.useGetDashboardMotobarListQuery

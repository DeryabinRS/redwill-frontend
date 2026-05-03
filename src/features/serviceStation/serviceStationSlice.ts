import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../config/constants'
import { getAuthToken } from '../../utils/auth'

export type ServiceStation = {
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

type ServiceStationResponse = {
  data: ServiceStation
}

type ServiceStationListResponse = {
  data: ServiceStation[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  next_page_url: string | null
  prev_page_url: string | null
}

type GetServiceStationListArgs = {
  pagination?: { page?: number; per_page?: number }
}

export const serviceStationApi = createApi({
  reducerPath: 'serviceStationApi',
  tagTypes: ['ServiceStations', 'ServiceStation'],
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
    getServiceStation: builder.query<ServiceStation, string | number>({
      query: (serviceStation) => ({
        url: `/service-stations/${serviceStation}`,
        method: 'GET',
      }),
      transformResponse: (response: ServiceStationResponse) => response.data,
      providesTags: (_result, _error, serviceStation) => [{ type: 'ServiceStation', id: serviceStation }],
    }),
    getServiceStationList: builder.query<ServiceStationListResponse, GetServiceStationListArgs | void>({
      query: (args) => ({
        url: '/service-stations',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 40,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: ServiceStationListResponse
      }) => response.data,
      providesTags: ['ServiceStations'],
    }),
    getUserServiceStations: builder.query<ServiceStationListResponse, GetServiceStationListArgs | void>({
      query: (args) => ({
        url: '/user/service-stations',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: ServiceStationListResponse
      }) => response.data,
      providesTags: ['ServiceStations'],
    }),
    getDashboardServiceStationList: builder.query<ServiceStationListResponse, GetServiceStationListArgs | void>({
      query: (args) => ({
        url: '/dashboard/service-stations',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: ServiceStationListResponse
      }) => response.data,
      providesTags: ['ServiceStations'],
    }),
    getDashboardServiceStation: builder.query<ServiceStation, string | number>({
      query: (serviceStation) => ({
        url: `/dashboard/service-stations/${serviceStation}`,
        method: 'GET',
      }),
      transformResponse: (response: ServiceStationResponse) => response.data,
      providesTags: (_result, _error, serviceStation) => [{ type: 'ServiceStation', id: serviceStation }],
    }),
    createServiceStation: builder.mutation<ServiceStation, FormData>({
      query: (payload) => ({
        url: '/service-stations',
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: ServiceStationResponse) => response.data,
      invalidatesTags: ['ServiceStations'],
    }),
    updateServiceStation: builder.mutation<ServiceStation, { serviceStation: string | number; payload: FormData }>({
      query: ({ serviceStation, payload }) => ({
        url: `/service-stations/${serviceStation}`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: ServiceStationResponse) => response.data,
      invalidatesTags: (_result, _error, { serviceStation }) => [
        'ServiceStations',
        { type: 'ServiceStation', id: serviceStation },
      ],
    }),
    uploadServiceStationLogo: builder.mutation<ServiceStation, { serviceStation: string | number; payload: FormData }>({
      query: ({ serviceStation, payload }) => ({
        url: `/service-stations/${serviceStation}/logo`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: ServiceStationResponse) => response.data,
      invalidatesTags: (_result, _error, { serviceStation }) => [
        'ServiceStations',
        { type: 'ServiceStation', id: serviceStation },
      ],
    }),
    deleteServiceStation: builder.mutation<void, string | number>({
      query: (serviceStation) => ({
        url: `/service-stations/${serviceStation}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceStations'],
    }),
  }),
})

export const {
  useCreateServiceStationMutation,
  useGetServiceStationQuery,
  useGetServiceStationListQuery,
  useGetUserServiceStationsQuery,
  useGetDashboardServiceStationQuery,
  useGetDashboardServiceStationListQuery,
  useUpdateServiceStationMutation,
  useUploadServiceStationLogoMutation,
  useDeleteServiceStationMutation,
} = serviceStationApi

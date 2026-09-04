import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAuthToken } from '../../utils/auth'
import { API_URL } from '../../config/constants'

export type MotorcycleOption = {
  value: string
  label: string
}

export type UserMotorcycle = {
  id: number
  motorcycle_make_id: string
  motorcycle_model_id: string
  make_name: string
  model_name: string
  mileage: number | null
  created_at?: string
  updated_at?: string
}

export type CreateUserMotorcyclePayload = {
  motorcycle_make_id: string
  motorcycle_model_id: string
  mileage?: number | null
}

export const motorcycleApi = createApi({
  reducerPath: 'motorcycleApi',
  tagTypes: ['UserMotorcycles'],
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
    getMotorcycleMakes: builder.query<MotorcycleOption[], void>({
      query: () => ({ url: '/motorcycles/makes', method: 'GET' }),
      transformResponse: (response: { data: MotorcycleOption[] }) => response.data,
    }),
    getMotorcycleModels: builder.query<MotorcycleOption[], string>({
      query: (makeId) => ({
        url: '/motorcycles/models',
        method: 'GET',
        params: { make_id: makeId },
      }),
      transformResponse: (response: { data: MotorcycleOption[] }) => response.data,
    }),
    getUserMotorcycles: builder.query<UserMotorcycle[], void>({
      query: () => ({ url: '/user/motorcycles', method: 'GET' }),
      transformResponse: (response: { data: UserMotorcycle[] }) => response.data,
      providesTags: ['UserMotorcycles'],
    }),
    createUserMotorcycle: builder.mutation<UserMotorcycle, CreateUserMotorcyclePayload>({
      query: (body) => ({
        url: '/user/motorcycles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: UserMotorcycle }) => response.data,
      invalidatesTags: ['UserMotorcycles'],
    }),
    deleteUserMotorcycle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/user/motorcycles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserMotorcycles'],
    }),
  }),
})

export const {
  useGetMotorcycleMakesQuery,
  useGetMotorcycleModelsQuery,
  useLazyGetMotorcycleModelsQuery,
  useGetUserMotorcyclesQuery,
  useCreateUserMotorcycleMutation,
  useDeleteUserMotorcycleMutation,
} = motorcycleApi

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../config/constants'
import { getAuthToken } from '../../utils/auth'

export type Motoclub = {
  id: number
  name: string
  desc: string | null
  logo: string | null
  website: string | null
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
}

type CreateMotoclubResponse = {
  data: Motoclub
}

export const motoclubApi = createApi({
  reducerPath: 'motoclubApi',
  tagTypes: ['Motoclubs'],
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
    createMotoclub: builder.mutation<Motoclub, FormData>({
      query: (payload) => ({
        url: '/motoclubs',
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreateMotoclubResponse) => response.data,
      invalidatesTags: ['Motoclubs'],
    }),
  }),
})

export const { useCreateMotoclubMutation } = motoclubApi

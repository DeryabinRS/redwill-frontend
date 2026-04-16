import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAuthToken } from '../../utils/auth'
import { API_URL } from '../../config/constants'

export type PostCategory = {
  id: number
  name: string
}

export type Post = {
  id: number
  title: string
  content: string
  post_category_id: number
  location: string | null
  latitude: number | null
  longitude: number | null
  image: string
  link: string | null
  date_start: string
  date_end: string | null
  time_start: string | null
  time_end: string | null
  user_id: number
  created_at: string
  updated_at: string
}

export type CreatePostPayload = {
  title: string
  content?: string
  post_category_id: number
  location?: string
  latitude?: number
  longitude?: number
  image: string
  link?: string
  date_start: string
  date_end?: string
  time_start?: string
  time_end?: string
}

type GetCategoriesResponse = {
  data: PostCategory[]
}

type CreatePostResponse = {
  data: Post
}

export const postApi = createApi({
  reducerPath: 'postApi',
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
    getPostCategories: builder.query<PostCategory[], void>({
      query: () => ({ url: '/post-categories', method: 'GET' }),
      transformResponse: (response: GetCategoriesResponse) => response.data,
    }),
    createPost: builder.mutation<Post, CreatePostPayload>({
      query: (payload) => ({
        url: '/posts',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: CreatePostResponse) => response.data,
    }),
  }),
})

export const { 
  useGetPostCategoriesQuery, 
  useLazyGetPostCategoriesQuery,
  useCreatePostMutation,
} = postApi

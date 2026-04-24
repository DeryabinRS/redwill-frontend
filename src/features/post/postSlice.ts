import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAuthToken } from '../../utils/auth'
import { API_URL } from '../../config/constants'
import dayjs from 'dayjs'

export type PostCategory = {
  id: number
  name: string
}

export type Post = {
  id: number
  title: string
  content: string
  post_category_id: number
  publication_status?: number
  moderation_status?: 0 | 1 | 2 | 3
  address?: string | null
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
  profile?: {
    first_name: string
    last_name: string
  }
  category?: {
    id: number
    name: string
  }
}

export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  next_page_url: string | null
  prev_page_url: string | null
}

export type CreatePostPayload = {
  title: string
  content?: string
  post_category_id: number
  location?: string
  latitude?: number
  longitude?: number
  image?: File
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

type GetPostResponse = {
  data: Post
}

type GetPostListResponse = {
  data: Post[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
  next_page_url: string | null
  prev_page_url: string | null
}

export const postApi = createApi({
  reducerPath: 'postApi',
  tagTypes: ['Posts', 'Post', 'UserPosts'],
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
    getPostList: builder.query<GetPostListResponse, { 
      pagination?: { page?: number, per_page?: number };
      post_category_ids?: number | number[];
    }>({
      query: ({ pagination, post_category_ids }) => ({ 
        url: '/posts', 
        params: { 
          page: pagination?.page, 
          per_page: pagination?.per_page || 10, 
          post_category_ids,
          min_start_date: dayjs().format('YYYY-MM-DD'),
          // max_start_date: '2026-05-01',
        },
      }),
      transformResponse: (response: { 
        response_code: number
        status: string
        message: string
        data: GetPostListResponse
      }) => response.data,
      providesTags: ['Posts'],
    }),
    getDashboardPostList: builder.query<GetPostListResponse, { pagination?: { page?: number, per_page?: number } } | void>({
      query: (args) => ({
        url: '/dashboard/posts',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: GetPostListResponse
      }) => response.data,
      providesTags: ['Posts'],
    }),
    getDashboardPost: builder.query<Post, string | number>({
      query: (post) => ({
        url: `/dashboard/posts/${post}`,
        method: 'GET',
      }),
      transformResponse: (response: GetPostResponse) => response.data,
      providesTags: (_result, _error, post) => [{ type: 'Post', id: post }],
    }),
    getUserPosts: builder.query<GetPostListResponse, { pagination?: { page?: number; per_page?: number } } | void>({
      query: (args) => ({
        url: '/user/posts',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: {
        response_code: number
        status: string
        message: string
        data: GetPostListResponse
      }) => response.data,
      providesTags: ['UserPosts'],
    }),
    getPost: builder.query<Post, string | number>({
      query: (post) => ({
        url: `/posts/${post}`,
        method: 'GET',
      }),
      transformResponse: (response: GetPostResponse) => response.data,
      providesTags: (_result, _error, post) => [{ type: 'Post', id: post }],
    }),
    createPost: builder.mutation<Post, FormData>({
      query: (payload) => ({
        url: '/posts',
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreatePostResponse) => response.data,
      invalidatesTags: ['Posts', 'UserPosts'],
    }),
    updatePost: builder.mutation<Post, { post: string | number; payload: FormData }>({
      query: ({ post, payload }) => ({
        url: `/posts/${post}`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreatePostResponse) => response.data,
      invalidatesTags: (_result, _error, { post }) => ['Posts', 'UserPosts', { type: 'Post', id: post }],
    }),
    uploadPostImage: builder.mutation<Post, { post: string | number; payload: FormData }>({
      query: ({ post, payload }) => ({
        url: `/posts/${post}/image`,
        method: 'POST',
        body: payload,
        formData: true,
      }),
      transformResponse: (response: CreatePostResponse) => response.data,
      invalidatesTags: (_result, _error, { post }) => ['Posts', 'UserPosts', { type: 'Post', id: post }],
    }),
    deletePost: builder.mutation<void, string | number>({
      query: (post) => ({
        url: `/posts/${post}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts', 'UserPosts'],
    }),
  }),
})

export const { 
  useGetPostCategoriesQuery, 
  useLazyGetPostCategoriesQuery,
  useCreatePostMutation,
  useGetPostListQuery,
  useGetDashboardPostListQuery,
  useGetDashboardPostQuery,
  useGetUserPostsQuery,
  useGetPostQuery,
  useUpdatePostMutation,
  useUploadPostImageMutation,
  useDeletePostMutation,
} = postApi

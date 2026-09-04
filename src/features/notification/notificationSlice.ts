import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getAuthToken } from '../../utils/auth'
import { API_URL } from '../../config/constants'

export type UserNotification = {
  id: number
  user_id?: number
  type: 'content_status' | 'motoclub_join_request' | string
  title: string
  body: string | null
  data: {
    entity_type?: string
    entity_id?: number
    entity_name?: string
    link?: string
    applicant_id?: number
    applicant_login?: string
    moderation_status?: number
    publication_status?: number
  } | null
  read_at: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    login: string
    email: string
  } | null
}

export type NotificationListResponse = {
  data: UserNotification[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export type UpdateNotificationPayload = {
  id: number
  title?: string
  body?: string | null
  type?: string
  mark_unread?: boolean
  read_at?: string | null
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  tagTypes: ['Notifications', 'NotificationsUnread', 'DashboardNotifications'],
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
    getNotifications: builder.query<UserNotification[], number | void>({
      query: (limit = 20) => ({
        url: '/user/notifications',
        method: 'GET',
        params: { limit },
      }),
      transformResponse: (response: { data: UserNotification[] }) => response.data,
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationsCount: builder.query<number, void>({
      query: () => ({ url: '/user/notifications/unread-count', method: 'GET' }),
      transformResponse: (response: { data: { count: number } }) => response.data.count,
      providesTags: ['NotificationsUnread'],
    }),
    markNotificationRead: builder.mutation<UserNotification, number>({
      query: (id) => ({
        url: `/user/notifications/${id}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response: { data: UserNotification }) => response.data,
      invalidatesTags: ['Notifications', 'NotificationsUnread', 'DashboardNotifications'],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/user/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications', 'NotificationsUnread', 'DashboardNotifications'],
    }),
    getDashboardNotifications: builder.query<
      NotificationListResponse,
      { pagination?: { page?: number; per_page?: number } } | void
    >({
      query: (args) => ({
        url: '/dashboard/notifications',
        params: {
          page: args?.pagination?.page,
          per_page: args?.pagination?.per_page || 10,
        },
      }),
      transformResponse: (response: { data: NotificationListResponse }) => response.data,
      providesTags: ['DashboardNotifications'],
    }),
    updateDashboardNotification: builder.mutation<UserNotification, UpdateNotificationPayload>({
      query: ({ id, ...body }) => ({
        url: `/dashboard/notifications/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { data: UserNotification }) => response.data,
      invalidatesTags: ['DashboardNotifications', 'Notifications', 'NotificationsUnread'],
    }),
    deleteDashboardNotification: builder.mutation<void, number>({
      query: (id) => ({
        url: `/dashboard/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DashboardNotifications', 'Notifications', 'NotificationsUnread'],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetDashboardNotificationsQuery,
  useUpdateDashboardNotificationMutation,
  useDeleteDashboardNotificationMutation,
} = notificationApi

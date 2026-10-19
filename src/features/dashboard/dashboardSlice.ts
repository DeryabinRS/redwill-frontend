import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

export type ModerationCounts = {
  count: number
  items: {
    posts: number
    motoclubs: number
    motobars: number
    moto_posts: number
    service_stations: number
  }
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery,
  endpoints: (builder) => ({
    getModerationCount: builder.query<ModerationCounts, void>({
      query: () => ({ url: '/dashboard/moderation-count', method: 'GET' }),
      transformResponse: (response: { data: ModerationCounts }) => response.data,
    }),
  }),
})

export const { useGetModerationCountQuery } = dashboardApi

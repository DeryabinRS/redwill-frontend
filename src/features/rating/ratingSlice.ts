import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

export type RateableType = 'post' | 'motoclub' | 'motobar' | 'moto-post' | 'service-station'

export type RatingResult = {
  stars_count: number
  is_starred: boolean
}

type RatingResponse = {
  data: RatingResult
}

type RatingArgs = {
  type: RateableType
  id: number
}

export const ratingApi = createApi({
  reducerPath: 'ratingApi',
  baseQuery,
  endpoints: (builder) => ({
    addRating: builder.mutation<RatingResult, RatingArgs>({
      query: ({ type, id }) => ({ url: `/ratings/${type}/${id}`, method: 'POST' }),
      transformResponse: (response: RatingResponse) => response.data,
    }),
    removeRating: builder.mutation<RatingResult, RatingArgs>({
      query: ({ type, id }) => ({ url: `/ratings/${type}/${id}`, method: 'DELETE' }),
      transformResponse: (response: RatingResponse) => response.data,
    }),
  }),
})

export const { useAddRatingMutation, useRemoveRatingMutation } = ratingApi

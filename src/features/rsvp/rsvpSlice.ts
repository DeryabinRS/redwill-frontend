import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

export type RsvpStatus = 'going' | 'maybe' | 'declined'

export type RsvpParticipant = {
  id: number
  status: RsvpStatus
  user: {
    id: number
    login: string
    nick_name: string | null
    avatar: string | null
  } | null
}

export type RsvpParticipants = {
  current_page: number
  data: RsvpParticipant[]
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export type RsvpCounts = {
  going: number
  maybe: number
  declined: number
}

export type RsvpData = {
  counts: RsvpCounts
  my_rsvp: RsvpStatus | null
  participants: RsvpParticipants
}

type RsvpResponse = {
  data: RsvpData
}

type SetRsvpResponse = {
  data: { my_rsvp: RsvpStatus; going_count: number }
}

type RemoveRsvpResponse = {
  data: { my_rsvp: null; going_count: number }
}

export const rsvpApi = createApi({
  reducerPath: 'rsvpApi',
  tagTypes: ['Rsvp'],
  baseQuery,
  endpoints: (builder) => ({
    getRsvp: builder.query<RsvpData, number>({
      query: (postId) => ({ url: `/posts/${postId}/rsvp`, method: 'GET' }),
      transformResponse: (response: RsvpResponse) => response.data,
      providesTags: (_result, _error, postId) => [{ type: 'Rsvp', id: postId }],
    }),
    setRsvp: builder.mutation<
      SetRsvpResponse['data'],
      { postId: number; status: RsvpStatus }
    >({
      query: ({ postId, status }) => ({
        url: `/posts/${postId}/rsvp`,
        method: 'POST',
        body: { status },
      }),
      transformResponse: (response: SetRsvpResponse) => response.data,
      invalidatesTags: (_result, _error, { postId }) => [{ type: 'Rsvp', id: postId }],
    }),
    removeRsvp: builder.mutation<RemoveRsvpResponse['data'], number>({
      query: (postId) => ({ url: `/posts/${postId}/rsvp`, method: 'DELETE' }),
      transformResponse: (response: RemoveRsvpResponse) => response.data,
      invalidatesTags: (_result, _error, postId) => [{ type: 'Rsvp', id: postId }],
    }),
  }),
})

export const {
  useGetRsvpQuery,
  useSetRsvpMutation,
  useRemoveRsvpMutation,
} = rsvpApi

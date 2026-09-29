import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

export type Friend = {
  id: number
  login: string
  nick_name?: string | null
  avatar?: string | null
}

type FriendStatusResponse = {
  data: { is_friend: boolean }
}

export const friendApi = createApi({
  reducerPath: 'friendApi',
  tagTypes: ['Friends'],
  baseQuery,
  endpoints: (builder) => ({
    getUserFriends: builder.query<Friend[], number>({
      query: (userId) => ({ url: `/users/${userId}/friends`, method: 'GET' }),
      transformResponse: (response: { data: Friend[] }) => response.data,
      providesTags: (_result, _error, userId) => [{ type: 'Friends', id: userId }],
    }),
    addFriend: builder.mutation<{ is_friend: boolean }, number>({
      query: (userId) => ({ url: `/users/${userId}/friends`, method: 'POST' }),
      transformResponse: (response: FriendStatusResponse) => response.data,
      invalidatesTags: ['Friends'],
    }),
    removeFriend: builder.mutation<{ is_friend: boolean }, number>({
      query: (userId) => ({ url: `/users/${userId}/friends`, method: 'DELETE' }),
      transformResponse: (response: FriendStatusResponse) => response.data,
      invalidatesTags: ['Friends'],
    }),
  }),
})

export const {
  useGetUserFriendsQuery,
  useAddFriendMutation,
  useRemoveFriendMutation,
} = friendApi

import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

export type Friend = {
  id: number
  login: string
  nick_name?: string | null
  avatar?: string | null
}

export type FriendStatus = 'none' | 'outgoing' | 'incoming' | 'accepted'

export type AddFriendResult = {
  status: FriendStatus
  is_friend?: boolean
}

export type FriendRequestItem = {
  id: number
  created_at: string
  user: Friend
}

export const friendApi = createApi({
  reducerPath: 'friendApi',
  tagTypes: ['Friends', 'FriendRequests'],
  baseQuery,
  endpoints: (builder) => ({
    getUserFriends: builder.query<Friend[], number>({
      query: (userId) => ({ url: `/users/${userId}/friends`, method: 'GET' }),
      transformResponse: (response: { data: Friend[] }) => response.data,
      providesTags: (_result, _error, userId) => [{ type: 'Friends', id: userId }],
    }),
    addFriend: builder.mutation<AddFriendResult, number>({
      query: (userId) => ({ url: `/users/${userId}/friends`, method: 'POST' }),
      transformResponse: (response: { data: AddFriendResult }) => response.data,
      invalidatesTags: ['Friends', 'FriendRequests'],
    }),
    removeFriend: builder.mutation<{ is_friend: boolean }, number>({
      query: (userId) => ({ url: `/users/${userId}/friends`, method: 'DELETE' }),
      transformResponse: (response: { data: { is_friend: boolean } }) => response.data,
      invalidatesTags: ['Friends', 'FriendRequests'],
    }),
    getFriendRequests: builder.query<FriendRequestItem[], void>({
      query: () => ({ url: '/user/friend-requests', method: 'GET' }),
      transformResponse: (response: { data: FriendRequestItem[] }) => response.data,
      providesTags: ['FriendRequests'],
    }),
    acceptFriendRequest: builder.mutation<{ is_friend: boolean }, number>({
      query: (userId) => ({ url: `/user/friend-requests/${userId}/accept`, method: 'POST' }),
      transformResponse: (response: { data: { is_friend: boolean } }) => response.data,
      invalidatesTags: ['Friends', 'FriendRequests'],
    }),
    declineFriendRequest: builder.mutation<{ is_friend: boolean }, number>({
      query: (userId) => ({ url: `/user/friend-requests/${userId}`, method: 'DELETE' }),
      transformResponse: (response: { data: { is_friend: boolean } }) => response.data,
      invalidatesTags: ['Friends', 'FriendRequests'],
    }),
  }),
})

export const {
  useGetUserFriendsQuery,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useGetFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
} = friendApi

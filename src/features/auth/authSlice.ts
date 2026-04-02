import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../config/constants'

export type User = {
  id: number
  email: string
  first_name?: string
  last_name?: string
}

export type LoginResponse = {
  response_code: number
  status: string
  message: string
  user_info: User
  token: string
  token_type: string
}

type LoginRequest = { email: string; password: string; recaptcha_token?: string; }
type RegisterRequest = { 
  email: string; 
  password: string; 
  first_name: string; 
  last_name: string;
  recaptcha_token?: string;
}

export type RegisterResponse = {
  response_code?: number
  status?: string
  message?: string
  user_info?: User
}


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL || '/api',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({ url: '/register', method: 'POST', body }),
    }),

    verifyEmail: builder.mutation<{ message?: string }, { hash?: string; id?: string } | void>({
      query: (arg) => {
        const hash = (arg as { hash?: string; id?: string } | undefined)?.hash
        const id = (arg as { hash?: string; id?: string } | undefined)?.id
        const body: Record<string, string> = {}
        if (hash) body.hash = hash
        if (id) body.id = id
        return { url: '/verify-email', method: 'POST', body }
      },
    }),
    resendVerification: builder.mutation<{ message?: string }, { email: string }>({
      query: (body) => ({ url: '/resend-verification', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<{ message?: string }, { email: string }>({
      query: (body) => ({ url: '/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<{ message?: string }, { id: string; hash: string; password: string }>({
      query: (body) => ({ url: '/reset-password', method: 'POST', body }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi

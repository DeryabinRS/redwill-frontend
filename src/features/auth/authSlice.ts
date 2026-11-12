import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '../../api/baseQuery'

export type User = {
  id: number
  email: string
  first_name?: string
  last_name?: string
  login: string
}

export type LoginResponse = {
  response_code: number
  status: string
  message: string
  token: string
  token_type: string
}

type LoginRequest = { email: string; password: string; recaptcha_token?: string; }
/** Параметры подписанной ссылки подтверждения из письма. */
export type VerifyEmailRequest = {
  id: string
  hash: string
  expires: string
  signature: string
}
/** Смена пароля по одноразовому токену password broker. */
export type ResetPasswordRequest = {
  email: string
  token: string
  password: string
}
type RegisterRequest = {
  email: string
  password: string
  login: string
  recaptcha_token?: string
}

export type RegisterResponse = {
  response_code?: number
  status?: string
  message?: string
  user_info?: User
}


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({ url: '/register', method: 'POST', body }),
    }),

    // Параметры подписанной ссылки из письма (id, hash, expires, signature) —
    // API сверяет подпись, поэтому их нужно передавать целиком и без правок.
    verifyEmail: builder.mutation<{ message?: string }, VerifyEmailRequest>({
      query: (body) => ({ url: '/verify-email', method: 'POST', body }),
    }),
    resendVerification: builder.mutation<{ message?: string }, { email: string }>({
      query: (body) => ({ url: '/resend-verification', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<{ message?: string }, { email: string }>({
      query: (body) => ({ url: '/forgot-password', method: 'POST', body }),
    }),
    // Ссылка из письма даёт email + одноразовый token из password broker.
    resetPassword: builder.mutation<{ message?: string }, ResetPasswordRequest>({
      query: (body) => ({ url: '/reset-password', method: 'POST', body }),
    }),
    logout: builder.mutation<{ message?: string }, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
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
  useLogoutMutation,
} = authApi

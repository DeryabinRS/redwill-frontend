import { configureStore, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../features/auth/authSlice'
import { userApi } from '../features/user/userSlice'
import { postApi } from '../features/post/postSlice'
import { motoclubApi } from '../features/motoclub/motoclubSlice'
import { motobarApi } from '../features/motobar/motobarSlice'

const appSlice = createSlice({
  name: 'app',
  initialState: { isInitialized: false },
  reducers: {
    setInitialized(state, action) {
      state.isInitialized = action.payload as boolean
    },
  },
})

export const { setInitialized } = appSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [motoclubApi.reducerPath]: motoclubApi.reducer,
    [motobarApi.reducerPath]: motobarApi.reducer,
  },
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      postApi.middleware,
      motoclubApi.middleware,
      motobarApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch



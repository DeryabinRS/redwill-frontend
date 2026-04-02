import { configureStore, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../features/auth/authSlice'
import { userApi } from '../features/user/userSlice'

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
  },
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, userApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch



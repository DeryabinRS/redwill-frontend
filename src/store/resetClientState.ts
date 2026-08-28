import type { AppDispatch } from './index'
import { authApi } from '../features/auth/authSlice'
import { userApi } from '../features/user/userSlice'
import { postApi } from '../features/post/postSlice'
import { motoclubApi } from '../features/motoclub/motoclubSlice'
import { motobarApi } from '../features/motobar/motobarSlice'
import { motoPostApi } from '../features/motoPost/motoPostSlice'
import { serviceStationApi } from '../features/serviceStation/serviceStationSlice'

/** Сброс кэша всех RTK Query API (при logout / смене пользователя). */
export function resetClientState(dispatch: AppDispatch) {
  dispatch(authApi.util.resetApiState())
  dispatch(userApi.util.resetApiState())
  dispatch(postApi.util.resetApiState())
  dispatch(motoclubApi.util.resetApiState())
  dispatch(motobarApi.util.resetApiState())
  dispatch(motoPostApi.util.resetApiState())
  dispatch(serviceStationApi.util.resetApiState())
}

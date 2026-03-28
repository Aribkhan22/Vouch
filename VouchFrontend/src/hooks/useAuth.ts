import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setAuth, logout as logoutAction } from '@store/authSlice';
import { authApi, LoginPayload, RegisterPayload } from '@api/auth.api';
import { tokenStorage } from '@utils/tokenStorage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(s => s.auth);

  const login = async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload);
    const { user: u, accessToken, refreshToken } = data.data;
    await tokenStorage.saveTokens(accessToken, refreshToken);
    dispatch(setAuth({ user: u, accessToken, refreshToken }));
    return u;
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await authApi.register(payload);
    const { user: u, accessToken, refreshToken } = data.data;
    await tokenStorage.saveTokens(accessToken, refreshToken);
    dispatch(setAuth({ user: u, accessToken, refreshToken }));
    return u;
  };

  const logout = async () => {
    await tokenStorage.clearTokens();
    dispatch(logoutAction());
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
};

import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setAuth, logout as logoutAction } from '@store/authSlice';
import { authApi, LoginPayload, RegisterPayload } from '@api/auth.api';
import { tokenStorage } from '@utils/tokenStorage';
import { User } from '../types';

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
    // Do NOT dispatch setAuth here — completeAuth() is called after onboarding
    return { user: u, accessToken, refreshToken };
  };

  const completeAuth = (u: User, accessToken: string, refreshToken: string) => {
    dispatch(setAuth({ user: u, accessToken, refreshToken }));
  };

  const logout = async () => {
    await tokenStorage.clearTokens();
    dispatch(logoutAction());
  };

  return { user, isAuthenticated, isLoading, login, register, completeAuth, logout };
};

import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = (): string | null => {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { path: '/' });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { path: '/' });
};

export const clearTokens = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = (): string | null => {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

export const setAccessToken = (token: string): void => {
  // Set cookie for 7 days (or whatever your access token expiry is, 
  // but Cookies.set without expires means session cookie)
  Cookies.set(ACCESS_TOKEN_KEY, token, { path: '/' });
};

export const clearAccessToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY);
};

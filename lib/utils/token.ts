// In-memory storage for the access token to protect against XSS
let _accessToken: string | null = null;

export const getAccessToken = (): string | null => {
  return _accessToken;
};

export const setAccessToken = (token: string): void => {
  _accessToken = token;
};

export const clearAccessToken = (): void => {
  _accessToken = null;
};

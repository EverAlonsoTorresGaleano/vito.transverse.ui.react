const TOKEN_KEY = 'vito_transverse_token';
const USER_INFO_KEY = 'vito_transverse_user_info';

export interface UserInfo {
  roleId?: number;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  companyId?: string;
}

export const authService = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getUserInfo: (): UserInfo | null => {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    if (!userInfoStr) return null;
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  },

  setUserInfo: (userInfo: UserInfo): void => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  removeUserInfo: (): void => {
    localStorage.removeItem(USER_INFO_KEY);
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }
};


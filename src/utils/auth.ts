const TOKEN_KEY = 'vito_transverse_token';
const USER_INFO_KEY = 'vito_transverse_user_info';
const LOGOFF_AT_KEY = 'vito_transverse_auto_logoff_at';

let autoLogoutTimer: number | null = null;

const getAutoLogoffMinutes = (): number | null => {
  const minutesStr = process.env.REACT_APP_AUTO_LOGOFF_TIME;
  if (!minutesStr) return null;
  const minutes = Number(minutesStr);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
};

const redirectToLogin = (): void => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

const clearAutoLogoutTimer = (): void => {
  if (autoLogoutTimer !== null) {
    window.clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
};

const scheduleAutoLogout = (): void => {
  clearAutoLogoutTimer();

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  const logoffAtStr = localStorage.getItem(LOGOFF_AT_KEY);
  const logoffAt = logoffAtStr ? Number(logoffAtStr) : NaN;
  const now = Date.now();

  if (!Number.isFinite(logoffAt)) {
    // If missing or invalid, compute from now using configured minutes
    const minutes = getAutoLogoffMinutes();
    if (!minutes) return;
    const next = now + minutes * 60_000;
    localStorage.setItem(LOGOFF_AT_KEY, String(next));
    autoLogoutTimer = window.setTimeout(() => {
      authService.logout();
      redirectToLogin();
    }, minutes * 60_000);
    return;
  }

  const remainingMs = logoffAt - now;
  if (remainingMs <= 0) {
    authService.logout();
    redirectToLogin();
    return;
  }

  autoLogoutTimer = window.setTimeout(() => {
    authService.logout();
    redirectToLogin();
  }, remainingMs);
};

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

    // Configure and store logoff deadline based on env minutes
    const minutes = getAutoLogoffMinutes();
    if (minutes) {
      const next = Date.now() + minutes * 60_000;
      localStorage.setItem(LOGOFF_AT_KEY, String(next));
      scheduleAutoLogout();
    } else {
      // If not configured, ensure any previous timer is cleared
      localStorage.removeItem(LOGOFF_AT_KEY);
      clearAutoLogoutTimer();
    }
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
    localStorage.removeItem(LOGOFF_AT_KEY);
    clearAutoLogoutTimer();
  }
};

/**
 * Initialize auto logout timer on application startup.
 * If a token exists and a deadline is stored, schedules logout;
 * if no deadline is stored but minutes are configured, it sets one.
 */
export const initAutoLogout = (): void => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    clearAutoLogoutTimer();
    localStorage.removeItem(LOGOFF_AT_KEY);
    return;
  }
  scheduleAutoLogout();
};


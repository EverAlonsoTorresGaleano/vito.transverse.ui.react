import { Client } from '../api/vito-transverse-identity-api';
import { authService } from '../utils/auth';
import config from '../config';

const API_BASE_URL = config.api.baseUrl;

const redirectToLogin = (): void => {
  authService.logout();

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

// Custom fetch function that adds authentication headers
const authenticatedFetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  const token = authService.getToken();
  
  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...init,
    headers: headers
  });

  if (response.status === 401) {
    redirectToLogin();
  }

  return response;
};

// Create and export a configured API client instance
export const apiClient = new Client(API_BASE_URL, { fetch: authenticatedFetch });


import { Client } from '../api/vito-transverse-identity-api';
import { authService } from '../utils/auth';
import config from '../config';

const API_BASE_URL = config.api.baseUrl;

// Custom fetch function that adds authentication headers
const authenticatedFetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  const token = authService.getToken();
  
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...init,
    headers: headers
  });
};

// Create and export a configured API client instance
export const apiClient = new Client(API_BASE_URL, { fetch: authenticatedFetch });


import { TokenRequestDTO, TokenResponseDTO } from '../api/vito-transverse-identity-api';
import config from '../config';

const API_BASE_URL = config.api.baseUrl;

export interface LoginCredentials {
  userName: string;
  password: string;
  company: string;
}

export const login = async (credentials: LoginCredentials): Promise<TokenResponseDTO> => {
  const requestBody: TokenRequestDTO = {
    user_id: credentials.userName,
    user_secret: credentials.password,
    company_id: credentials.company,
    company_secret: "",
    application_id: config.auth.applicationId,
    application_secret: config.auth.applicationSecret,
  };
  
  const response = await fetch(`${API_BASE_URL}/api/Oauth2/v1/Token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Login failed: ${response.status} ${response.statusText}`);
  }

  const tokenResponse: TokenResponseDTO = await response.json();
  return tokenResponse;
};


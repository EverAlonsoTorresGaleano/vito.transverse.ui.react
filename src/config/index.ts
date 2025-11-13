/**
 * Application configuration
 * 
 * This module centralizes all configuration values from environment variables.
 * Environment variables are loaded from .env files (Create React App supports this).
 * 
 * Usage:
 *   import config from './config';
 *   const apiUrl = config.api.baseUrl;
 */

interface ApiConfig {
  baseUrl: string;
}

interface AuthConfig {
  applicationId: string;
  applicationSecret: string;
}

interface AppConfig {
  api: ApiConfig;
  auth: AuthConfig;
}

/**
 * Get configuration from environment variables
 * Throws an error if required environment variables are missing
 */
const getConfig = (): AppConfig => {
  // API Configuration
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('REACT_APP_API_BASE_URL environment variable is required');
  }

  // Authentication Configuration
  const applicationId = process.env.REACT_APP_APPLICATION_ID;
  if (!applicationId) {
    throw new Error('REACT_APP_APPLICATION_ID environment variable is required');
  }

  const applicationSecret = process.env.REACT_APP_APPLICATION_SECRET;
  if (!applicationSecret) {
    throw new Error('REACT_APP_APPLICATION_SECRET environment variable is required');
  }

  return {
    api: {
      baseUrl: apiBaseUrl,
    },
    auth: {
      applicationId,
      applicationSecret,
    },
  };
};

// Export the configuration object
const config = getConfig();

export default config;


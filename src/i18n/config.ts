import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { CultureTranslationDTO } from '../api/vito-transverse-identity-api';
import config from '../config';

/**
 * Load translations from the API for a given culture/language
 * Uses a direct API client to avoid authentication issues
 */
export const loadTranslationsFromApi = async (cultureId: string): Promise<Record<string, string>> => {
  try {
    // Use a direct client for translations (may work without auth for public translations)
    const { Client } = await import('../api/vito-transverse-identity-api');
    const { default: config } = await import('../config');
    const directClient = new Client(config.api.baseUrl);
    
    const translations = await directClient.getApiLocalizationsV1ByCulture(cultureId);
    const resources: Record<string, string> = {};
    
    translations.forEach((translation: CultureTranslationDTO) => {
      if (translation.translationKey && translation.translationValue) {
        resources[translation.translationKey] = translation.translationValue;
      }
    });
    
    return resources;
  } catch (error) {
    console.error('Error loading translations from API:', error);
    // Return empty object - fallback to default strings will be used
    return {};
  }
};

// Initialize with empty resources - translations will be loaded dynamically
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: config.api.defaultLanguage, // Default language
    debug: process.env.NODE_ENV === 'development',
    
    resources: {
      es: {
        translation: {}, // Will be loaded from API
      },
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // React i18next options
    react: {
      useSuspense: false, // Disable suspense for now
    },
  });

export default i18n;


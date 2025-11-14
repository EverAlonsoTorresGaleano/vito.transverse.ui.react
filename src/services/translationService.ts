import i18n from '../i18n';
import config from '../config';
import { loadTranslationsFromApi } from '../i18n/config';

/**
 * Service to manage translations and language changes
 */
export const translationService = {
  /**
   * Change the application language and load translations from API
   */
  async changeLanguage(cultureId: string): Promise<void> {
    try {
      // Load translations from API
      const translations = await loadTranslationsFromApi(cultureId);
      
      // Add translations to i18next
      i18n.addResourceBundle(cultureId, 'translation', translations, true, true);
      
      // Change the language
      await i18n.changeLanguage(cultureId);
      
      // Store in localStorage
      localStorage.setItem('i18nextLng', cultureId);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  },

  /**
   * Initialize translations for the current language
   */
  async initializeLanguage(cultureId?: string): Promise<void> {
    const language = cultureId || i18n.language || config.api.defaultLanguage;
    
    // Check if translations are already loaded
    if (i18n.hasResourceBundle(language, 'translation')) {
      return;
    }
    
    try {
      const translations = await loadTranslationsFromApi(language);
      i18n.addResourceBundle(language, 'translation', translations, true, true);
    } catch (error) {
      console.error('Error initializing translations:', error);
    }
  },

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return i18n.language;
  },
};

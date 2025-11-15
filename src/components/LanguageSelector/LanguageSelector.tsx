import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListItemDTO } from '../../api/vito-transverse-identity-api';
import { apiClient } from '../../services/apiService';
import config from '../../config';
import { translationService } from '../../services/translationService';
import './LanguageSelector.css';

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage) {
      return storedLanguage;
    }
  }

  const currentLanguage = translationService.getCurrentLanguage();
  if (currentLanguage) {
    return currentLanguage;
  }

  return config.api.defaultLanguage;
};

interface LanguageSelectorProps {
  showSelectedLanguage?: boolean;
  compact?: boolean;
  showLabel?: boolean;
  setDefaultLanguage?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ showSelectedLanguage = false, showLabel = false, setDefaultLanguage = false }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorType, setErrorType] = useState<'load' | 'change' | null>(null);
  const [languages, setLanguages] = useState<ListItemDTO[]>([]);
  // Initialize from localStorage to preserve language from login page
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => getInitialLanguage());
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [languagesError, setLanguagesError] = useState<string | null>(null);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const selectId = useMemo(() => 'language-selector', []);

  useEffect(() => {
    const fetchLanguages = async () => {
        setLoadingLanguages(true);
        setLanguagesError(null);
        try {
         const languagesList = await apiClient.getApiMasterV1CulturesActiveDropDown();
          setLanguages(languagesList);
          
          // Initialize language from localStorage (preserved from login page)
          const storedLanguage = getInitialLanguage();
          
          if (languagesList.length > 0) {
            // Check if stored language exists in the available languages list
            const storedLangExists = languagesList.some(lang => lang.id === storedLanguage);
            
            if (storedLangExists) {
              // Use the stored language (from login page)
              setSelectedLanguage(storedLanguage);
              // Initialize translations for the stored language
              await translationService.initializeLanguage(storedLanguage);
            } else {
              // Stored language not available, use default or first available
              const defaultLang = languagesList.find(lang => lang.id === config.api.defaultLanguage) || languagesList[0];
              if (defaultLang?.id) {
                setSelectedLanguage(defaultLang.id);
                await translationService.initializeLanguage(defaultLang.id);
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load languages';
          setLanguagesError(errorMessage);
          console.error('Error fetching languages:', error);
        } finally {
          setLoadingLanguages(false);
        }
      };

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== i18n.language) {
      const changeLanguage = async () => {
        setChangingLanguage(true);
        try {
          await translationService.changeLanguage(selectedLanguage);
        } catch (error) {
          console.error('Error changing language:', error);
        } finally {
          setChangingLanguage(false);
        }
      };
      changeLanguage();
    }
  }, [selectedLanguage, i18n.language]);


  return (
    <div >


    {loadingLanguages ? (
      <div className="language-dropdown" style={{ color: '#666', fontStyle: 'italic' }}>
        {t('DropDown_LoadingData')}
      </div>
    ) : languagesError ? (
      <div className="language-dropdown" style={{ color: '#d32f2f' }}>
        {languagesError}
      </div>
    ) : (
      <select
        id="language"
        name="language"
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="language-dropdown"
        disabled={isLoading || loadingLanguages || changingLanguage}
      >
        {showSelectedLanguage && <option value="">{t('DropDown_SelectLanguage')}</option>}
        {languages
          .filter(lang => lang.isEnabled !== false)
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map((language) => (
            <option key={language.id || ''} value={language.id || ''}>
              { t(language.nameTranslationKey || '') }
            </option>
          ))}
      </select>
    )}
   
    </div>
  );
};

export default LanguageSelector;


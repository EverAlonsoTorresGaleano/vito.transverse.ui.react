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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
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
          // Set default language if available
          if (languagesList.length > 0 && !selectedLanguage) {
            const defaultLang =  { id: config.api.defaultLanguage };
            setSelectedLanguage(defaultLang.id || '');
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

    /*const currentLang = translationService.getCurrentLanguage();
    if (currentLang) {
      translationService.initializeLanguage(currentLang);
    }*/
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


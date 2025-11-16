import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { CountryDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const ViewCountry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [country, setCountry] = useState<CountryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      if (!id) {
        setError(t('Label_CountryIdRequired'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getApiMasterV1Countries(id);
        setCountry(data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchCountry();
  }, [id, t]);

  const handleEdit = () => {
    if (country?.id) {
      navigate(`/country/edit/${country.id}`);
    }
  };

  const handleBack = () => {
    navigate('/countries');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewCountryPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewCountryPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewCountryPage_Title')}</h1>
        </div>
        <div className="error">{t('Label_NotFound')}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleBack}>
            ← {t('Button_Back')}
          </button>
          <h1>{t('ViewCountryPage_Title')}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit')}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {country.nameTranslationKey ? country.nameTranslationKey.charAt(0).toUpperCase() : (country.id || 'C').charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">
            {country.nameTranslationKey || country.id || t('Label_NoName')}
          </h2>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('ViewCountryPage_BasicInfo')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Id')}</label>
                <div className="detail-value">{country.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Name')}</label>
                <div className="detail-value">{country.nameTranslationKey || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_UtcHoursDifference')}</label>
                <div className="detail-value">{country.utcHoursDifference ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCountry;



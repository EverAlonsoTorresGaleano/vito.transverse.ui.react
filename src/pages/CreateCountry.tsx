import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { CountryDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const CreateCountry: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    nameTranslationKey: '',
    utcHoursDifference: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.id || !formData.nameTranslationKey) {
      setError(t('Label_RequiredFieldsMissing'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const dto: CountryDTO = {
        id: formData.id,
        nameTranslationKey: formData.nameTranslationKey,
        utcHoursDifference: formData.utcHoursDifference === '' ? undefined : Number(formData.utcHoursDifference)
      };

      const created = await apiClient.postApiMasterV1Countries(dto);
      navigate(`/country/view/${created.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/countries');
  };

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('NewCountryPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey
              ? formData.nameTranslationKey.charAt(0).toUpperCase()
              : (formData.id || 'C').charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || formData.id || t('NewCountryPage_NewCountry')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">{t('NewCountryPage_BasicInfo')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="id">
                  {t('Label_Id')} *
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nameTranslationKey">
                  {t('Label_Name')} *
                </label>
                <input
                  type="text"
                  id="nameTranslationKey"
                  name="nameTranslationKey"
                  value={formData.nameTranslationKey}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="utcHoursDifference">
                  {t('Label_UtcHoursDifference')}
                </label>
                <input
                  type="number"
                  id="utcHoursDifference"
                  name="utcHoursDifference"
                  value={formData.utcHoursDifference}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>
              {t('Button_Cancel')}
            </button>
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? t('Button_Saving') : t('Button_Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCountry;



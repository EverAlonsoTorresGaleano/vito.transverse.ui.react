import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/auth';
import { apiClient } from '../services/apiService';
import { CompanyDTO, CompanyApplicationsDTO, ListItemDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const CreateCompany: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameTranslationKey: '',
    descriptionTranslationKey: '',
    email: '',
    subdomain: '',
    defaultCultureFk: '',
    countryFk: '',
    isActive: true,
    isSystemCompany: false
  });
  const [countries, setCountries] = useState<ListItemDTO[]>([]);
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [cultures, setCultures] = useState<ListItemDTO[]>([]);
  const [loadingCultures, setLoadingCultures] = useState<boolean>(false);
  const [culturesError, setCulturesError] = useState<string | null>(null);
  const userInfo = authService.getUserInfo();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userInfo?.userId || !userInfo?.companyId) {
      setError(t('Label_UserInfoError'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const userId = parseInt(userInfo.userId, 10);
      const companyId = parseInt(userInfo.companyId, 10);
      
      /*if (isNaN(userId) || isNaN(companyId)) {
        throw new Error(t('Label_InvalidUserInfo'));
      }*/

      // Create company applications DTO
      const companyApplications: CompanyApplicationsDTO = {
        userId: userId,
        company: {
          nameTranslationKey: formData.nameTranslationKey,
          descriptionTranslationKey: formData.descriptionTranslationKey,
          email: formData.email,
          subdomain: formData.subdomain,
          defaultCultureFk: formData.defaultCultureFk || undefined,
          countryFk: formData.countryFk || undefined,
          isActive: formData.isActive,
          isSystemCompany: formData.isSystemCompany
        } as CompanyDTO,
        applications: []
      };

      const createdCompany = await apiClient.postApiCompaniesV1(companyApplications);

      // Navigate to view page
      navigate(`/company/view/${createdCompany.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      setCountriesError(null);
      try {
        const countriesList = await apiClient.getApiMasterV1CountriesDropdown();
        setCountries(countriesList);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load countries';
        setCountriesError(errorMessage);
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    const fetchCultures = async () => {
      setLoadingCultures(true);
      setCulturesError(null);
      try {
        const culturesList = await apiClient.getApiMasterV1CulturesActiveDropDown();
        setCultures(culturesList);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load cultures';
        setCulturesError(errorMessage);
        console.error('Error fetching cultures:', error);
      } finally {
        setLoadingCultures(false);
      }
    };

    fetchCountries();
    fetchCultures();
  }, []);

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('NewCompanyPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'C'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('NewCompanyPage_NewCompany')}
          </h2>
          {formData.subdomain && (
            <p className="profile-username">@{formData.subdomain}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">{t('NewCompanyPage_BasicInfo')}</h3>
            <div className="form-grid">
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
                <label htmlFor="email">
                  {t('Label_Email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="subdomain">
                  {t('Label_Subdomain')}
                </label>
                <input
                  type="text"
                  id="subdomain"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="defaultCultureFk">
                  {t('Label_DefaultCulture')}
                </label>
                {loadingCultures ? (
                  <div className="form-input" style={{ color: '#666', fontStyle: 'italic' }}>
                    {t('DropDown_LoadingData')}
                  </div>
                ) : culturesError ? (
                  <div className="form-input input-error" style={{ color: '#d32f2f' }}>
                    {culturesError}
                  </div>
                ) : (
                  <select
                    id="defaultCultureFk"
                    name="defaultCultureFk"
                    value={formData.defaultCultureFk}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loadingCultures}
                  >
                    <option value="">{t('DropDown_SelectOption')}</option>
                    {cultures
                      .filter(culture => culture.isEnabled !== false)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((culture) => (
                        <option key={culture.id || ''} value={culture.id || ''}>
                          { t(culture.nameTranslationKey || '') || culture.id || 'Unnamed Culture'}
                        </option>
                      ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="countryFk">
                  {t('Label_Country')}
                </label>
                {loadingCountries ? (
                  <div className="form-input" style={{ color: '#666', fontStyle: 'italic' }}>
                    {t('DropDown_LoadingData')}
                  </div>
                ) : countriesError ? (
                  <div className="form-input input-error" style={{ color: '#d32f2f' }}>
                    {countriesError}
                  </div>
                ) : (
                  <select
                    id="countryFk"
                    name="countryFk"
                    value={formData.countryFk}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loadingCountries}
                  >
                    <option value="">{t('DropDown_SelectOption') }</option>
                    {countries
                      .filter(country => country.isEnabled !== false)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((country) => (
                        <option key={country.id || ''} value={country.id || ''}>
                          { country.nameTranslationKey  || country.id || 'Unnamed Country'}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="descriptionTranslationKey">
                {t('Label_Description')}
              </label>
              <textarea
                id="descriptionTranslationKey"
                name="descriptionTranslationKey"
                value={formData.descriptionTranslationKey}
                onChange={handleChange}
                className="form-input"
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">{t('NewCompanyPage_Settings')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <span>{t('Label_IsActive')}</span>
                </label>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isSystemCompany"
                    checked={formData.isSystemCompany}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <span>{t('Label_IsSystemCompany')}</span>
                </label>
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

export default CreateCompany;


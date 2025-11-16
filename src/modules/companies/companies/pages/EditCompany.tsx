import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { CompanyDTO, ListItemDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditCompany: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setError(t('Label_CompanyIdRequired'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const companyId = parseInt(id, 10);
        if (isNaN(companyId)) {
          throw new Error(t('Label_InvalidCompanyId'));
        }
        const companyData = await apiClient.getApiCompaniesV1(companyId);
        setCompany(companyData);
        setFormData({
          nameTranslationKey: companyData.nameTranslationKey || '',
          descriptionTranslationKey: companyData.descriptionTranslationKey || '',
          email: companyData.email || '',
          subdomain: companyData.subdomain || '',
          defaultCultureFk: companyData.defaultCultureFk || '',
          countryFk: companyData.countryFk || '',
          isActive: companyData.isActive ?? true,
          isSystemCompany: companyData.isSystemCompany ?? false
        });
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, t]);

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
    if (!company || !company.id) return;

    try {
      setSaving(true);
      setError(null);

      const updatedCompany: CompanyDTO = {
        ...company,
        nameTranslationKey: formData.nameTranslationKey,
        descriptionTranslationKey: formData.descriptionTranslationKey,
        email: formData.email,
        subdomain: formData.subdomain,
        defaultCultureFk: formData.defaultCultureFk || undefined,
        countryFk: formData.countryFk || undefined,
        isActive: formData.isActive,
        isSystemCompany: formData.isSystemCompany
      };

      await apiClient.putApiCompaniesV1(updatedCompany);

      navigate(`/company/view/${company.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (company?.id) {
      navigate(`/company/view/${company.id}`);
    } else {
      navigate('/companies');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditCompanyPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditCompanyPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => navigate('/companies')} style={{ marginTop: '20px' }}>
          ←   ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('EditCompanyPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {company?.avatar ? (
            <img src={company.avatar} alt={company.nameTranslationKey || 'Company'} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large-initials">
              {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('Label_UnnamedCompany')}
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
            <h3 className="section-title">{t('EditCompanyPage_BasicInfo')}</h3>
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
            <h3 className="section-title">{t('EditCompanyPage_Settings')}</h3>
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
              {saving ? t('Button_SaveUpdating') : t('Button_SaveUpdate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompany;


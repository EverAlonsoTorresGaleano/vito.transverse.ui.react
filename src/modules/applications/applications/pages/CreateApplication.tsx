import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../../utils/auth';
import { apiClient } from '../../../../services/apiService';
import { ApplicationDTO, ListItemDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const CreateApplication: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameTranslationKey: '',
    descriptionTranslationKey: '',
    applicationClient: '',
    applicationSecret: '',
    companyId: '',
    isActive: true
  });
  const [companies, setCompanies] = useState<ListItemDTO[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
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
    
    if (!userInfo?.userId) {
      setError(t('Label_UserInfoError'));
      return;
    }
    if (!formData.companyId) {
      setError(t('Label_CompanyIdRequired'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const userId = parseInt(userInfo.userId, 10);
      const companyId = parseInt(formData.companyId, 10);

      const applicationDTO: ApplicationDTO = {
        nameTranslationKey: formData.nameTranslationKey,
        descriptionTranslationKey: formData.descriptionTranslationKey,
        applicationClient: formData.applicationClient,
        applicationSecret: formData.applicationSecret,
        companyId: companyId,
        isActive: formData.isActive
      };

      const created = await apiClient.postApiApplicationsV1(companyId, userId, applicationDTO);

      navigate(`/application/view/${created.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/applications');
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError(null);
      try {
        const companiesList = await apiClient.getApiCompaniesV1Dropdown();
        setCompanies(companiesList);
        if (!formData.companyId && companiesList.length > 0) {
          // Preselect current user's company if available
          const defaultCompanyId = userInfo?.companyId || companiesList[0].id || '';
          setFormData(prev => ({ ...prev, companyId: defaultCompanyId || '' }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load companies';
        setCompaniesError(errorMessage);
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('NewApplicationPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'A'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('NewApplicationPage_NewApplication')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">{t('NewApplicationPage_BasicInfo')}</h3>
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
                <label htmlFor="applicationClient">
                  {t('Label_Client')}
                </label>
                <input
                  type="text"
                  id="applicationClient"
                  name="applicationClient"
                  value={formData.applicationClient}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="applicationSecret">
                  {t('Label_Secret')}
                </label>
                <input
                  type="text"
                  id="applicationSecret"
                  name="applicationSecret"
                  value={formData.applicationSecret}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyId">
                  {t('Label_Company')}
                </label>
                {loadingCompanies ? (
                  <div className="form-input" style={{ color: '#666', fontStyle: 'italic' }}>
                    {t('DropDown_LoadingData')}
                  </div>
                ) : companiesError ? (
                  <div className="form-input input-error" style={{ color: '#d32f2f' }}>
                    {companiesError}
                  </div>
                ) : (
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loadingCompanies}
                  >
                    <option value="">{t('DropDown_SelectOption')}</option>
                    {companies
                      .filter(c => c.isEnabled !== false)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((c) => (
                        <option key={c.id || ''} value={c.id || ''}>
                          { c.nameTranslationKey || c.id || 'Unnamed Company'}
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
            <h3 className="section-title">{t('NewApplicationPage_Settings')}</h3>
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

export default CreateApplication;



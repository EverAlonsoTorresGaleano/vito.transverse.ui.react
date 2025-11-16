import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { ApplicationDTO, ListItemDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditApplication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [application, setApplication] = useState<ApplicationDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError(null);
      try {
        const companiesList = await apiClient.getApiCompaniesV1Dropdown();
        setCompanies(companiesList);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load companies';
        setCompaniesError(errorMessage);
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError(t('Label_ApplicationIdRequired'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const appId = parseInt(id, 10);
        if (isNaN(appId)) {
          throw new Error(t('Label_InvalidApplicationId'));
        }
        const appData = await apiClient.getApiApplicationsV1(appId);
        setApplication(appData);
        setFormData({
          nameTranslationKey: appData.nameTranslationKey || '',
          descriptionTranslationKey: appData.descriptionTranslationKey || '',
          applicationClient: appData.applicationClient || '',
          applicationSecret: appData.applicationSecret || '',
          companyId: appData.companyId ? String(appData.companyId) : '',
          isActive: appData.isActive ?? true
        });
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchApplication();
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
    if (!application || !application.id) return;

    try {
      setSaving(true);
      setError(null);

      const updatedApplication: ApplicationDTO = {
        ...application,
        nameTranslationKey: formData.nameTranslationKey,
        descriptionTranslationKey: formData.descriptionTranslationKey,
        applicationClient: formData.applicationClient,
        applicationSecret: formData.applicationSecret,
        companyId: formData.companyId ? parseInt(formData.companyId, 10) : undefined,
        isActive: formData.isActive
      };

      await apiClient.putApiApplicationsV1(updatedApplication);

      navigate(`/application/view/${application.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (application?.id) {
      navigate(`/application/view/${application.id}`);
    } else {
      navigate('/applications');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditApplicationPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditApplicationPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => navigate('/applications')} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
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
          <h1>{t('EditApplicationPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'A'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('Label_UnnamedApplication')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">{t('EditApplicationPage_BasicInfo')}</h3>
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
            <h3 className="section-title">{t('EditApplicationPage_Settings')}</h3>
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
              {saving ? t('Button_SaveUpdating') : t('Button_SaveUpdate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApplication;



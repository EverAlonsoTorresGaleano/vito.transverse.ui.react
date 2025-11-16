import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/apiService';
import { ListItemDTO, UserDTO } from '../api/vito-transverse-identity-api';
import { authService } from '../utils/auth';
import './UserProfile.css';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<ListItemDTO[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const userInfo = authService.getUserInfo();

  const [formData, setFormData] = useState({
    companyId: '',
    userName: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.companyId) {
      setError(t('Label_CompanyIdRequired') || 'Company is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const companyId = parseInt(formData.companyId, 10);
      const newUser: UserDTO = {
        companyFk: companyId,
        userName: formData.userName,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password || undefined,
        isActive: formData.isActive
      };
      const created = await apiClient.postApiUsersV1(companyId, newUser);
      navigate(`/user/view/${created.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (t('Label_CreateError') || 'Failed to create user');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError(null);
      try {
        const companiesList = await apiClient.getApiCompaniesV1Dropdown();
        setCompanies(companiesList);
        if (!formData.companyId) {
          const defaultCompanyId = userInfo?.companyId || companiesList[0]?.id || '';
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
            ← {t('Button_Cancel') || 'Cancel'}
          </button>
          <h1>{t('NewUserPage_Title') || 'New User'}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.name ? formData.name.charAt(0).toUpperCase() : (formData.userName ? formData.userName.charAt(0).toUpperCase() : 'U')}
          </div>
          <h2 className="profile-name">
            {`${formData.name} ${formData.lastName}`.trim() || (t('NewUserPage_NewUser') || 'New user')}
          </h2>
          <p className="profile-username">{formData.userName ? `@${formData.userName}` : ''}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h3 className="section-title">{t('NewUserPage_BasicInfo') || 'Basic information'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="companyId">{t('Label_Company') || 'Company'}</label>
                {loadingCompanies ? (
                  <div className="form-input" style={{ color: '#666', fontStyle: 'italic' }}>
                    {t('DropDown_LoadingData') || 'Loading...'}
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
                    <option value="">{t('DropDown_SelectOption') || 'Select...'}</option>
                    {companies
                      .filter(c => c.isEnabled !== false)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((c) => (
                        <option key={c.id || ''} value={c.id || ''}>
                          {c.nameTranslationKey || c.id || 'Unnamed Company'}
                        </option>
                      ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="userName">{t('Label_Username') || 'Username'} *</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">{t('Label_FirstName') || 'First name'} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">{t('Label_LastName') || 'Last name'} *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t('Label_Email') || 'Email'} *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">{t('Label_Password') || 'Password'}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">{t('NewUserPage_Settings') || 'Settings'}</h3>
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
                  <span>{t('Label_IsActive') || 'Is Active'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>
              {t('Button_Cancel') || 'Cancel'}
            </button>
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? (t('Button_Saving') || 'Saving...') : (t('Button_Save') || 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;



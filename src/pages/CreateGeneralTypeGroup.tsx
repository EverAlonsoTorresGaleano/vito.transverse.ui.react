import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { GeneralTypeGroupDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const CreateGeneralTypeGroup: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameTranslationKey: '',
    isSystemType: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const dto: GeneralTypeGroupDTO = {
        nameTranslationKey: formData.nameTranslationKey,
        isSystemType: formData.isSystemType
      };
      const created = await apiClient.postApiMasterV1GeneralTypeGroups(dto);
      navigate(`/general-type-group/view/${created.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/general-type-groups');
  };

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('NewGeneralTypeGroupPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'G'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('NewGeneralTypeGroupPage_New')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h3 className="section-title">{t('NewGeneralTypeGroupPage_BasicInfo')}</h3>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isSystemType"
                    checked={formData.isSystemType}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <span>{t('Label_IsSystemType')}</span>
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

export default CreateGeneralTypeGroup;



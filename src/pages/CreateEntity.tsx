import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { EntityDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const CreateEntity: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    schemaName: '',
    entityName: '',
    isActive: true,
    isSystemEntity: false
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
      const newEntity: EntityDTO = {
        schemaName: formData.schemaName,
        entityName: formData.entityName,
        isActive: formData.isActive,
        isSystemEntity: formData.isSystemEntity
      };
      const created = await apiClient.postApiAuditoriesV1Entities(newEntity);
      navigate(`/entity/view/${created.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/entities');
  };

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('NewEntityPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.entityName ? formData.entityName.charAt(0).toUpperCase() : 'E'}
          </div>
          <h2 className="profile-name">
            {formData.entityName || t('NewEntityPage_NewEntity')}
          </h2>
          {formData.schemaName && (
            <p className="profile-username">{formData.schemaName}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">{t('NewEntityPage_BasicInfo')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="schemaName">
                  {t('Label_Schema')} *
                </label>
                <input
                  type="text"
                  id="schemaName"
                  name="schemaName"
                  value={formData.schemaName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="entityName">
                  {t('Label_Entity')} *
                </label>
                <input
                  type="text"
                  id="entityName"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">{t('NewEntityPage_Settings')}</h3>
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
                    name="isSystemEntity"
                    checked={formData.isSystemEntity}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <span>{t('Label_IsSystemEntity')}</span>
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

export default CreateEntity;



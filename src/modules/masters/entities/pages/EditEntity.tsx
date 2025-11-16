import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { EntityDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditEntity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [entity, setEntity] = useState<EntityDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    schemaName: '',
    entityName: '',
    isActive: true,
    isSystemEntity: false
  });

  useEffect(() => {
    const fetchEntity = async () => {
      if (!id) {
        setError(t('Label_EntityIdRequired'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const entityId = parseInt(id, 10);
        if (isNaN(entityId)) {
          throw new Error(t('Label_InvalidEntityId'));
        }
        const entityData = await apiClient.getApiAuditoriesV1Entities(entityId);
        setEntity(entityData);
        setFormData({
          schemaName: entityData.schemaName || '',
          entityName: entityData.entityName || '',
          isActive: entityData.isActive ?? true,
          isSystemEntity: entityData.isSystemEntity ?? false
        });
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchEntity();
  }, [id, t]);

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
    if (!entity || !entity.id) return;
    try {
      setSaving(true);
      setError(null);
      const updated: EntityDTO = {
        ...entity,
        schemaName: formData.schemaName,
        entityName: formData.entityName,
        isActive: formData.isActive,
        isSystemEntity: formData.isSystemEntity
      };
      await apiClient.putApiAuditoriesV1Entities(updated);
      navigate(`/entity/view/${entity.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (entity?.id) {
      navigate(`/entity/view/${entity.id}`);
    } else {
      navigate('/entities');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditEntityPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error && !entity) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditEntityPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => navigate('/entities')} style={{ marginTop: '20px' }}>
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
          <h1>{t('EditEntityPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.entityName ? formData.entityName.charAt(0).toUpperCase() : 'E'}
          </div>
          <h2 className="profile-name">
            {formData.entityName || t('Label_UnnamedEntity')}
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
            <h3 className="section-title">{t('EditEntityPage_BasicInfo')}</h3>
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
            <h3 className="section-title">{t('EditEntityPage_Settings')}</h3>
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
              {saving ? t('Button_SaveUpdating') : t('Button_SaveUpdate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEntity;



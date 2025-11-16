import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { EntityDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewEntity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [entity, setEntity] = useState<EntityDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchEntity();
  }, [id, t]);

  const handleEdit = () => {
    if (entity?.id) {
      navigate(`/entity/edit/${entity.id}`);
    }
  };

  const handleBack = () => {
    navigate('/entities');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewEntityPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewEntityPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewEntityPage_Title')}</h1>
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
          <h1>{t('ViewEntityPage_Title')}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit')}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {entity.entityName ? entity.entityName.charAt(0).toUpperCase() : 'E'}
          </div>
          <h2 className="profile-name">
            {entity.entityName || t('Label_NoName')}
          </h2>
          {entity.schemaName && (
            <p className="profile-username">{entity.schemaName}</p>
          )}
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('ViewEntityPage_BasicInfo')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_EntityId')}</label>
                <div className="detail-value">{entity.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Schema')}</label>
                <div className="detail-value">{entity.schemaName || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Entity')}</label>
                <div className="detail-value">{entity.entityName || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">{t('ViewEntityPage_Status')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Status')}</label>
                <div className="detail-value">
                  <span className={`status-badge ${entity.isActive ? 'active' : 'inactive'}`}>
                    {entity.isActive ? t('GridView_Active') : t('GridView_Inactive')}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <label>{t('Label_SystemEntity')}</label>
                <div className="detail-value">
                  {entity.isSystemEntity ? t('Label_Yes') : t('Label_No')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEntity;



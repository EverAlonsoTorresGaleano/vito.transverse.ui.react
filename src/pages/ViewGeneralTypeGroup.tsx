import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { GeneralTypeGroupDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const ViewGeneralTypeGroup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [group, setGroup] = useState<GeneralTypeGroupDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        setError(t('Label_IdRequired'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const groupId = parseInt(id, 10);
        const data = await apiClient.getApiMasterV1GeneralTypeGroups(groupId);
        setGroup(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id, t]);

  const handleEdit = () => {
    if (group?.id) {
      navigate(`/general-type-group/edit/${group.id}`);
    }
  };

  const handleBack = () => {
    navigate('/general-type-groups');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewGeneralTypeGroupPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewGeneralTypeGroupPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewGeneralTypeGroupPage_Title')}</h1>
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
          <h1>{t('ViewGeneralTypeGroupPage_Title')}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit')}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {group.nameTranslationKey ? group.nameTranslationKey.charAt(0).toUpperCase() : 'G'}
          </div>
          <h2 className="profile-name">
            {group.nameTranslationKey || t('Label_NoName')}
          </h2>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('Label_Details')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Id')}</label>
                <div className="detail-value">{group.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Name')}</label>
                <div className="detail-value">{group.nameTranslationKey || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_SystemType')}</label>
                <div className="detail-value">
                  {group.isSystemType ? t('Label_Yes') : t('Label_No')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGeneralTypeGroup;



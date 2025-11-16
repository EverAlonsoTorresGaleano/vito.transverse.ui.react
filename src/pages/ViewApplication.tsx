import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { ApplicationDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const ViewApplication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [application, setApplication] = useState<ApplicationDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError('Application ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const appId = parseInt(id, 10);
        if (isNaN(appId)) {
          throw new Error('Invalid application ID');
        }
        const appData = await apiClient.getApiApplicationsV1(appId);
        setApplication(appData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load application information';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleEdit = () => {
    if (application?.id) {
      navigate(`/application/edit/${application.id}`);
    }
  };

  const handleBack = () => {
    navigate('/applications');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewApplicationPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewApplicationPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewApplicationPage_Title')}</h1>
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
          <h1>{t('ViewApplicationPage_Title')}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit')}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {application.nameTranslationKey ? application.nameTranslationKey.charAt(0).toUpperCase() : 'A'}
          </div>
          <h2 className="profile-name">
            {application.nameTranslationKey || t('Label_NoName')}
          </h2>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('ViewApplicationPage_BasicInfo')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_ApplicationId')}</label>
                <div className="detail-value">{application.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Name')}</label>
                <div className="detail-value">{application.nameTranslationKey || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Client')}</label>
                <div className="detail-value">{application.applicationClient || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Secret')}</label>
                <div className="detail-value">{application.applicationSecret || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_CompanyId')}</label>
                <div className="detail-value">{application.companyId ?? 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Description')}</label>
                <div className="detail-value">{application.descriptionTranslationKey || 'N/A'}</div>
              </div>
            </div>
          </div>

          {(application.creationDate || application.lastUpdateDate) && (
            <div className="detail-section">
              <h3 className="section-title">{t('ViewApplicationPage_Metadata')}</h3>
              <div className="detail-grid">
                {application.creationDate && (
                  <div className="detail-item">
                    <label>{t('Label_CreationDate')}</label>
                    <div className="detail-value">
                      {new Date(application.creationDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {application.lastUpdateDate && (
                  <div className="detail-item">
                    <label>{t('Label_LastUpdate')}</label>
                    <div className="detail-value">
                      {new Date(application.lastUpdateDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {application.createdByUserFk && (
                  <div className="detail-item">
                    <label>{t('Label_CreatedBy')}</label>
                    <div className="detail-value">{application.createdByUserFk}</div>
                  </div>
                )}
                {application.lastUpdateByUserFk && (
                  <div className="detail-item">
                    <label>{t('Label_UpdatedBy')}</label>
                    <div className="detail-value">{application.lastUpdateByUserFk}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3 className="section-title">{t('ViewApplicationPage_Status')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Status')}</label>
                <div className="detail-value">
                  <span className={`status-badge ${application.isActive ? 'active' : 'inactive'}`}>
                    {application.isActive ? t('GridView_Active') : t('GridView_Inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplication;



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../../services/apiService';
import { UserDTO } from '../../../../api/vito-transverse-identity-api';
import '../../../../styles/UserProfile.css';

const ViewUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError(t('Label_IdRequired') || 'User ID is required');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
          throw new Error(t('Label_InvalidId') || 'Invalid user ID');
        }
        const data = await apiClient.getApiUsersV1(userId);
        setUser(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : (t('Label_LoadError') || 'Failed to load user');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, t]);

  const handleEdit = () => {
    if (user?.id) {
      navigate(`/user/edit/${user.id}`);
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewUserPage_Title') || 'User details'}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData') || 'Loading...'}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewUserPage_Title') || 'User details'}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back') || 'Back'}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewUserPage_Title') || 'User details'}</h1>
        </div>
        <div className="error">{t('Label_NotFound') || 'Not found'}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back') || 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleBack}>
            ← {t('Button_Back') || 'Back'}
          </button>
          <h1>{t('ViewUserPage_Title') || 'User details'}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit') || 'Edit'}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large-initials">
              {(user.name || user.userName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="profile-name">
            {`${user.name || ''} ${user.lastName || ''}`.trim() || (user.userName || t('Label_NoName') || 'Unnamed')}
          </h2>
          {user.userName && <p className="profile-username">@{user.userName}</p>}
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('ViewUserPage_BasicInfo') || 'Basic info'}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_UserId') || 'User ID'}</label>
                <div className="detail-value">{user.id ?? 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Email') || 'Email'}</label>
                <div className="detail-value">{user.email || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_CompanyId') || 'Company ID'}</label>
                <div className="detail-value">{user.companyFk ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          {(user.creationDate || user.lastUpdateDate) && (
            <div className="detail-section">
              <h3 className="section-title">{t('ViewUserPage_Metadata') || 'Metadata'}</h3>
              <div className="detail-grid">
                {user.creationDate && (
                  <div className="detail-item">
                    <label>{t('Label_CreationDate') || 'Created'}</label>
                    <div className="detail-value">
                      {new Date(user.creationDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {user.lastUpdateDate && (
                  <div className="detail-item">
                    <label>{t('Label_LastUpdate') || 'Last update'}</label>
                    <div className="detail-value">
                      {new Date(user.lastUpdateDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3 className="section-title">{t('ViewUserPage_Status') || 'Status'}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Status') || 'Status'}</label>
                <div className="detail-value">
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? (t('GridView_Active') || 'Active') : (t('GridView_Inactive') || 'Inactive')}
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

export default ViewUser;

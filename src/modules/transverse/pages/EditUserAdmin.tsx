import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/apiService';
import { UserDTO } from '../../../api/vito-transverse-identity-api';
import './UserProfile.css';

const EditUserAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    name: '',
    lastName: '',
    email: '',
    isActive: true
  });

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
        const userData = await apiClient.getApiUsersV1(userId);
        setUser(userData);
        setFormData({
          userName: userData.userName || '',
          name: userData.name || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          isActive: userData.isActive ?? true
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : (t('Label_LoadError') || 'Failed to load user');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
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
    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      const updated: UserDTO = {
        ...user,
        userName: formData.userName,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        isActive: formData.isActive
      };
      await apiClient.putApiUsersV1(updated);
      navigate(`/user/view/${user.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (t('Label_UpdateError') || 'Failed to update user');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user?.id) {
      navigate(`/user/view/${user.id}`);
    } else {
      navigate('/users');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditUserPage_Title') || 'Edit user'}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData') || 'Loading...'}</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditUserPage_Title') || 'Edit user'}</h1>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel') || 'Cancel'}
          </button>
          <h1>{t('EditUserPage_Title') || 'Edit user'}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large-initials">
              {(formData.name || formData.userName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="profile-name">
            {`${formData.name} ${formData.lastName}`.trim()}
          </h2>
          <p className="profile-username">@{formData.userName}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h3 className="section-title">{t('EditUserPage_BasicInfo') || 'Basic information'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="userName">{t('Label_Username') || 'Username'}</label>
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
                <label htmlFor="name">{t('Label_FirstName') || 'First name'}</label>
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
                <label htmlFor="lastName">{t('Label_LastName') || 'Last name'}</label>
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
                <label htmlFor="email">{t('Label_Email') || 'Email'}</label>
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

export default EditUserAdmin;



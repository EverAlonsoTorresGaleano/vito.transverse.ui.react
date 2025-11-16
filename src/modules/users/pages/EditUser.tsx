import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../../utils/auth';
import { apiClient } from '../../../services/apiService';
import { UserDTO } from '../../../api/vito-transverse-identity-api';
import '../../../styles/UserProfile.css';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    userName: ''
  });


  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('User information not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
          throw new Error('Invalid user ID');
        }
        const userData = await apiClient.getApiUsersV1(userId);
        setUser(userData);
        setFormData({
          name: userData.name || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          userName: userData.userName || ''
        });
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user information';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.id) return;

    try {
      setSaving(true);
      setError(null);

      const updatedUser: UserDTO = {
        ...user,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        userName: formData.userName
      };

      await apiClient.putApiUsersV1(updatedUser);

      // Update stored user info if username changed
      if (formData.userName !== user?.userName) {
        authService.setUserInfo({
          ...user,
          userName: formData.userName
        });
      }

      navigate(`/user/view/${id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user information';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if(user?.id) {
      navigate(`/user/view/${user.id}`);
    } else {
      navigate('/users');
    }
  
    
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>Edit Profile</h1>
        </div>
        <div className="loading">Loading user information...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>Edit Profile</h1>
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
            ← Cancel
          </button>
          <h1>Edit Profile</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large-initials">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <h2 className="profile-name">
            {formData.name} {formData.lastName}
          </h2>
          <p className="profile-username">@{formData.userName}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="userName">Username</label>
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
                <label htmlFor="name">First Name</label>
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
                <label htmlFor="lastName">Last Name</label>
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
                <label htmlFor="email">Email</label>
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
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;




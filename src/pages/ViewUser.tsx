import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/auth';
import { apiClient } from '../services/apiService';
import { UserDTO } from '../api/vito-transverse-identity-api';
import './UserProfile.css';

const ViewUser: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userInfo?.userId) {
        setError('User information not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Convert userId string to number if needed
        const userId = parseInt(userInfo.userId, 10);
        if (isNaN(userId)) {
          throw new Error('Invalid user ID');
        }
        const userData = await apiClient.getApiUsersV1(userId);
        setUser(userData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user information';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userInfo]);

  const handleEdit = () => {
    navigate('/user/edit');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>View Profile</h1>
        </div>
        <div className="loading">Loading user information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>View Profile</h1>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>View Profile</h1>
          <button className="edit-button" onClick={handleEdit}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large-initials">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <h2 className="profile-name">
            {user?.name} {user?.lastName}
          </h2>
          <p className="profile-username">@{user?.userName}</p>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>User ID</label>
                <div className="detail-value">{user?.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Username</label>
                <div className="detail-value">{user?.userName || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>First Name</label>
                <div className="detail-value">{user?.name || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Last Name</label>
                <div className="detail-value">{user?.lastName || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <div className="detail-value">{user?.email || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Email Validated</label>
                <div className="detail-value">
                  {user?.emailValidated ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">Account Status</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Status</label>
                <div className="detail-value">
                  <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <label>Locked</label>
                <div className="detail-value">
                  {user?.isLocked ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="detail-item">
                <label>Require Password Change</label>
                <div className="detail-value">
                  {user?.requirePasswordChange ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="detail-item">
                <label>Company ID</label>
                <div className="detail-value">{user?.companyFk || 'N/A'}</div>
              </div>
            </div>
          </div>

          {user?.creationDate && (
            <div className="detail-section">
              <h3 className="section-title">Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Creation Date</label>
                  <div className="detail-value">
                    {new Date(user.creationDate).toLocaleDateString()}
                  </div>
                </div>
                {user.lastAccess && (
                  <div className="detail-item">
                    <label>Last Access</label>
                    <div className="detail-value">
                      {new Date(user.lastAccess).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {user.lastUpdateDate && (
                  <div className="detail-item">
                    <label>Last Update</label>
                    <div className="detail-value">
                      {new Date(user.lastUpdateDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;


import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../utils/auth';
import './UserAvatar.css';

const UserAvatar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleView = () => {
    setIsOpen(false);
    navigate('/user/view');
  };

  const handleEdit = () => {
    setIsOpen(false);
    navigate('/user/edit');
  };

  const handleLogout = () => {
    setIsOpen(false);
    authService.logout();
    navigate('/login');
  };

  const getInitials = (): string => {
    if (userInfo?.userName) {
      const parts = userInfo.userName.split(/[\s._-]/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return userInfo.userName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const displayName = userInfo?.userName || 'User';

  return (
    <div className="user-avatar-container" ref={dropdownRef}>
      <button
        className="user-avatar-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {userInfo?.userAvatar ? (
          <img
            src={userInfo.userAvatar}
            alt={displayName}
            className="user-avatar-image"
          />
        ) : (
          <div className="user-avatar-initials">
            {getInitials()}
          </div>
        )}
        <span className="user-avatar-name">{displayName}</span>
        <span className="user-avatar-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="user-avatar-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-user-info">
              {userInfo?.userAvatar ? (
                <img
                  src={userInfo.userAvatar}
                  alt={displayName}
                  className="dropdown-avatar"
                />
              ) : (
                <div className="dropdown-avatar-initials">
                  {getInitials()}
                </div>
              )}
              <div className="dropdown-user-details">
                <div className="dropdown-user-name">{displayName}</div>
                {userInfo?.userId && (
                  <div className="dropdown-user-id">ID: {userInfo.userId}</div>
                )}
              </div>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={handleView}>
            <span className="dropdown-icon">👁️</span>
            View Profile
          </button>
          <button className="dropdown-item" onClick={handleEdit}>
            <span className="dropdown-icon">✏️</span>
            Edit Profile
          </button>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item logout-item" onClick={handleLogout}>
            <span className="dropdown-icon">🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;


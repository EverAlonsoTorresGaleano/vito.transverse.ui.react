import React, { useState, useEffect } from 'react';
import './ListPage.css';

interface User {
  id: number;
  name: string;
  email?: string;
  [key: string]: any;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, using mock data
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Mock data
        setUsers([
          { id: 1, name: 'User 1', email: 'user1@example.com' },
          { id: 2, name: 'User 2', email: 'user2@example.com' },
          { id: 3, name: 'User 3', email: 'user3@example.com' }
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="list-page">
        <div className="page-header">
          <h1>Users</h1>
        </div>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page">
        <div className="page-header">
          <h1>Users</h1>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Users</h1>
        <p className="page-subtitle">Manage your users</p>
      </div>
      <div className="list-container">
        <div className="list-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>
                      <button className="action-button">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;



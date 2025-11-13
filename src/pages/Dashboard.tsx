import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to Vito Transverse</h2>
          <p>You have successfully logged in to the Identity Management System.</p>
          <p>Use the navigation menu on the left to manage Applications, Companies, and Users.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


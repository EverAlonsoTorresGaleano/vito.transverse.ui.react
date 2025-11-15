import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompaniesList from './pages/CompaniesList';
import ViewUser from './pages/ViewUser';
import EditUser from './pages/EditUser';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { authService } from './utils/auth';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/companies" element={<CompaniesList />} />
                  <Route path="/user/view" element={<ViewUser />} />
                  <Route path="/user/edit" element={<EditUser />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;



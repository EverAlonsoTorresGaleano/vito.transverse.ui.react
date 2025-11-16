import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompaniesList from './pages/CompaniesList';
import ViewCompany from './pages/ViewCompany';
import CreateCompany from './pages/CreateCompany';
import EditCompany from './pages/EditCompany';
import ApplicationsList from './pages/ApplicationsList';
import ViewApplication from './pages/ViewApplication';
import CreateApplication from './pages/CreateApplication';
import EditApplication from './pages/EditApplication';
import ViewUser from './pages/ViewUser';
import EditUser from './pages/EditUser';
import LanguagesList from './pages/LanguagesList';
import ViewLanguage from './pages/ViewLanguage';
import CreateLanguage from './pages/CreateLanguage';
import EditLanguage from './pages/EditLanguage';
import CountriesList from './pages/CountriesList';
import ViewCountry from './pages/ViewCountry';
import CreateCountry from './pages/CreateCountry';
import EditCountry from './pages/EditCountry';
import EntitiesList from './pages/EntitiesList';
import ViewEntity from './pages/ViewEntity';
import CreateEntity from './pages/CreateEntity';
import EditEntity from './pages/EditEntity';
import GeneralTypeGroupsList from './pages/GeneralTypeGroupsList';
import ViewGeneralTypeGroup from './pages/ViewGeneralTypeGroup';
import CreateGeneralTypeGroup from './pages/CreateGeneralTypeGroup';
import EditGeneralTypeGroup from './pages/EditGeneralTypeGroup';
import GeneralTypeItemsList from './pages/GeneralTypeItemsList';
import ViewGeneralTypeItem from './pages/ViewGeneralTypeItem';
import CreateGeneralTypeItem from './pages/CreateGeneralTypeItem';
import EditGeneralTypeItem from './pages/EditGeneralTypeItem';
import SequencesList from './pages/SequencesList';
import CreateSequence from './pages/CreateSequence';
import EditSequence from './pages/EditSequence';
import CulturesList from './pages/CulturesList';
import ViewCulture from './pages/ViewCulture';
import CreateCulture from './pages/CreateCulture';
import EditCulture from './pages/EditCulture';
import ViewSequence from './pages/ViewSequence';
import NotificationTemplatesList from './pages/NotificationTemplatesList';
import ViewNotificationTemplate from './pages/ViewNotificationTemplate';
import CreateNotificationTemplate from './pages/CreateNotificationTemplate';
import EditNotificationTemplate from './pages/EditNotificationTemplate';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { authService } from './utils/auth';
import CreateUser from './pages/CreateUser';
import UsersList from './pages/UsersList';
import CompanyEntityAuditsList from './pages/CompanyEntityAuditsList';
import ViewCompanyEntityAudit from './pages/ViewCompanyEntityAudit';
import CreateCompanyEntityAudit from './pages/CreateCompanyEntityAudit';
import EditCompanyEntityAudit from './pages/EditCompanyEntityAudit';

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
                  <Route path="/company/view/:id" element={<ViewCompany />} />
                  <Route path="/company/create" element={<CreateCompany />} />
                  <Route path="/company/edit/:id" element={<EditCompany />} />
                  <Route path="/applications" element={<ApplicationsList />} />
                  <Route path="/application/view/:id" element={<ViewApplication />} />
                  <Route path="/application/create" element={<CreateApplication />} />
                  <Route path="/application/edit/:id" element={<EditApplication />} />
                  <Route path="/languages" element={<LanguagesList />} />
                  <Route path="/language/create" element={<CreateLanguage />} />
                  <Route path="/language/view/:id" element={<ViewLanguage />} />
                  <Route path="/language/edit/:id" element={<EditLanguage />} />
                  <Route path="/countries" element={<CountriesList />} />
                  <Route path="/country/create" element={<CreateCountry />} />
                  <Route path="/country/view/:id" element={<ViewCountry />} />
                  <Route path="/country/edit/:id" element={<EditCountry />} />
                  <Route path="/entities" element={<EntitiesList />} />
                  <Route path="/entity/create" element={<CreateEntity />} />
                  <Route path="/entity/view/:id" element={<ViewEntity />} />
                  <Route path="/entity/edit/:id" element={<EditEntity />} />
                  <Route path="/general-type-groups" element={<GeneralTypeGroupsList />} />
                  <Route path="/general-type-group/create" element={<CreateGeneralTypeGroup />} />
                  <Route path="/general-type-group/view/:id" element={<ViewGeneralTypeGroup />} />
                  <Route path="/general-type-group/edit/:id" element={<EditGeneralTypeGroup />} />
                  <Route path="/general-type-items" element={<GeneralTypeItemsList />} />
                  <Route path="/general-type-item/create" element={<CreateGeneralTypeItem />} />
                  <Route path="/general-type-item/view/:id" element={<ViewGeneralTypeItem />} />
                  <Route path="/general-type-item/edit/:id" element={<EditGeneralTypeItem />} />
                  <Route path="/sequences" element={<SequencesList />} />
                  <Route path="/sequence/create" element={<CreateSequence />} />
                  <Route path="/sequence/view/:id" element={<ViewSequence />} />
                  <Route path="/sequence/edit/:id" element={<EditSequence />} />
                  <Route path="/cultures" element={<CulturesList />} />
                  <Route path="/culture/create" element={<CreateCulture />} />
                  <Route path="/culture/view/:id" element={<ViewCulture />} />
                  <Route path="/culture/edit/:id" element={<EditCulture />} />
                  <Route path="/notification-templates" element={<NotificationTemplatesList />} />
                  <Route path="/notification-template/create" element={<CreateNotificationTemplate />} />
                  <Route path="/notification-template/view/:id" element={<ViewNotificationTemplate />} />
                  <Route path="/notification-template/edit/:id" element={<EditNotificationTemplate />} />
                  <Route path="/users" element={<UsersList />} />
                  <Route path="/user/create" element={<CreateUser />} />
                  <Route path="/user/view/:id" element={<ViewUser />} />
                  <Route path="/user/edit/:id" element={<EditUser />} />
                  <Route path="/company-entity-audits" element={<CompanyEntityAuditsList />} />
                  <Route path="/company-entity-audit/create" element={<CreateCompanyEntityAudit />} />
                  <Route path="/company-entity-audit/view/:id" element={<ViewCompanyEntityAudit />} />
                  <Route path="/company-entity-audit/edit/:id" element={<EditCompanyEntityAudit />} />
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



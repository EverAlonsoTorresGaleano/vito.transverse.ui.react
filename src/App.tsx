import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './modules/transverse/pages/Login';
import Dashboard from './modules/transverse/pages/Dashboard';
import CompaniesList from './modules/companies/companies/pages/CompaniesList';
import ViewCompany from './modules/companies/companies/pages/ViewCompany';
import CreateCompany from './modules/companies/companies/pages/CreateCompany';
import EditCompany from './modules/companies/companies/pages/EditCompany';
import ApplicationsList from './modules/applications/applications/pages/ApplicationsList';
import ViewApplication from './modules/applications/applications/pages/ViewApplication';
import CreateApplication from './modules/applications/applications/pages/CreateApplication';
import EditApplication from './modules/applications/applications/pages/EditApplication';
import ViewUser from './modules/masters/sequences/pages/ViewUser';
import EditUser from './modules/users/pages/EditUser';
import LanguagesList from './modules/masters/languages/pages/LanguagesList';
import ViewLanguage from './modules/masters/languages/pages/ViewLanguage';
import CreateLanguage from './modules/masters/languages/pages/CreateLanguage';
import EditLanguage from './modules/masters/languages/pages/EditLanguage';
import CountriesList from './modules/masters/countries/pages/CountriesList';
import ViewCountry from './modules/masters/countries/pages/ViewCountry';
import CreateCountry from './modules/masters/countries/pages/CreateCountry';
import EditCountry from './modules/masters/countries/pages/EditCountry';
import EntitiesList from './modules/masters/entities/pages/EntitiesList';
import ViewEntity from './modules/masters/entities/pages/ViewEntity';
import CreateEntity from './modules/masters/entities/pages/CreateEntity';
import EditEntity from './modules/masters/entities/pages/EditEntity';
import GeneralTypeGroupsList from './modules/masters/general-type-groups/pages/GeneralTypeGroupsList';
import ViewGeneralTypeGroup from './modules/masters/general-type-groups/pages/ViewGeneralTypeGroup';
import CreateGeneralTypeGroup from './modules/masters/general-type-groups/pages/CreateGeneralTypeGroup';
import EditGeneralTypeGroup from './modules/masters/general-type-groups/pages/EditGeneralTypeGroup';
import GeneralTypeItemsList from './modules/masters/general-type-items/pages/GeneralTypeItemsList';
import ViewGeneralTypeItem from './modules/masters/general-type-items/pages/ViewGeneralTypeItem';
import CreateGeneralTypeItem from './modules/masters/general-type-items/pages/CreateGeneralTypeItem';
import EditGeneralTypeItem from './modules/masters/general-type-items/pages/EditGeneralTypeItem';
import SequencesList from './modules/masters/sequences/pages/SequencesList';
import CreateSequence from './modules/masters/sequences/pages/CreateSequence';
import EditSequence from './modules/masters/sequences/pages/EditSequence';
import CulturesList from './modules/masters/cultures/pages/CulturesList';
import ViewCulture from './modules/masters/cultures/pages/ViewCulture';
import CreateCulture from './modules/masters/cultures/pages/CreateCulture';
import EditCulture from './modules/masters/cultures/pages/EditCulture';
import ViewSequence from './modules/masters/sequences/pages/ViewSequence';
import NotificationTemplatesList from './modules/masters/notification-templates/pages/NotificationTemplatesList';
import ViewNotificationTemplate from './modules/masters/notification-templates/pages/ViewNotificationTemplate';
import CreateNotificationTemplate from './modules/masters/notification-templates/pages/CreateNotificationTemplate';
import EditNotificationTemplate from './modules/masters/notification-templates/pages/EditNotificationTemplate';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { authService } from './utils/auth';
import CreateUser from './modules/users/pages/CreateUser';
import UsersList from './modules/users/pages/UsersList';
import CompanyEntityAuditsList from './modules/masters/company-entity-audits/pages/CompanyEntityAuditsList';
import ViewCompanyEntityAudit from './modules/masters/company-entity-audits/pages/ViewCompanyEntityAudit';
import CreateCompanyEntityAudit from './modules/masters/company-entity-audits/pages/CreateCompanyEntityAudit';
import EditCompanyEntityAudit from './modules/masters/company-entity-audits/pages/EditCompanyEntityAudit';

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



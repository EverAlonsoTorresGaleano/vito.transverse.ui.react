import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';

import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';
import CompaniesList from '../../../companies/companies/pages/CompaniesList';

const ApplicationsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentCulture, setCurrentCulture] = useState<string>('');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiApplicationsV1All();
      setApplications(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeCulture = async () => {
      try {
        const detectedLanguage =
          translationService.getCurrentLanguage() || config.api.defaultLanguage;
        await translationService.initializeLanguage(detectedLanguage);
        setCurrentCulture(detectedLanguage);
      } catch (cultureError) {
        console.error('Error initializing culture language:', cultureError);
        setCurrentCulture(config.api.defaultLanguage);
      } finally {
        fetchApplications();
      }
    };

    initializeCulture();
  }, [fetchApplications]);

  const handleDelete = async (applicationId: number) => {
    if (!window.confirm(t('ApplicationsListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(applicationId);
      await apiClient.deleteApiApplicationsV1Delete(applicationId);
      await fetchApplications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application';
      alert(errorMessage);
      console.error('Error deleting application:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (applicationId: number) => {
    navigate(`/application/view/${applicationId}`);
  };

  const handleEdit = (applicationId: number) => {
    navigate(`/application/edit/${applicationId}`);
  };

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return applications.filter(app => {
      const id = app.id?.toString() || '';
      const name = app.nameTranslationKey?.toLowerCase() || '';
      const client = app.applicationClient?.toLowerCase() || '';
      const status = app.isActive ? 'active' : 'inactive';
      const companyId = app.companyId?.toString() || '';
      
      return (
        id.includes(searchLower) ||
        name.includes(searchLower) ||
        client.includes(searchLower) ||
        companyId.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [applications, searchTerm]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  if (loading) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('ApplicationsListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('ApplicationsListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchApplications}>
          <FaRedo /> {t('GridView_RetryButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('ApplicationsListPage_Title')}</h1>
        <p className="page-subtitle">{t('ApplicationsListPage_Subtitle')}</p>
      </div>
      <div className="list-container">
        <div className="list-card">
          <div className="search-container">
            <div className="search-controls">
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('Label_SearchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="search-clear-button"
                    onClick={() => setSearchTerm('')}
                    title={t('Button_ClearSearch_Tooltip')}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <button
                className="new-company-button"
                onClick={() => navigate('/application/create')}
                title={t('Button_New_Tooltip')}
              >
                <FaPlus /> {t('Button_New')}
              </button>
            </div>
            {searchTerm && (
              <div className="-results-infosearch">
              </div>
            )}
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('Label_Id')}</th>
                  <th>{t('Label_Name')}</th>
                  <th>{t('Label_Client')}</th>
                  <th>{t('Label_CompanyId')}</th>
                  <th>{t('Label_Status')}</th>
                  <th>{t('Label_CreatedDate')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map(app => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">
                          {app.nameTranslationKey || 'N/A'}
                        </div>
                      </td>
                      <td>{app.applicationClient || 'N/A'}</td>
                      <td>{app.companyId ?? 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${app.isActive ? 'active' : 'inactive'}`}>
                          {app.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td>
                        {app.creationDate
                          ? new Date(app.creationDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(app.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(app.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(app.id!)}
                            disabled={deletingId === app.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === app.id ?
                             t('Button_Deleting') : t('Button_Delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredApplications.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredApplications.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="applications"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsList;



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';
const CompaniesList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentCulture, setCurrentCulture] = useState<string>('');

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiCompaniesV1All();
      setCompanies(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load companies';
      setError(errorMessage);
      console.error('Error fetching companies:', err);
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
        fetchCompanies();
      }
    };

    initializeCulture();
  }, [fetchCompanies]);

  const handleDelete = async (companyId: number) => {
    if (!window.confirm(t('CompaniesListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(companyId);
      await apiClient.deleteApiCompaniesV1Delete(companyId);
      // Refresh the list after deletion
      await fetchCompanies();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company';
      alert(errorMessage);
      console.error('Error deleting company:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (companyId: number) => {
    navigate(`/company/view/${companyId}`);
  };

  const handleEdit = (companyId: number) => {
    navigate(`/company/edit/${companyId}`);
  };

  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) {
      return companies;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return companies.filter(company => {
      const id = company.id?.toString() || '';
      const name = company.nameTranslationKey?.toLowerCase() || '';
      const email = company.email?.toLowerCase() || '';
      const subdomain = company.subdomain?.toLowerCase() || '';
      const status = company.isActive ? 'active' : 'inactive';
      
      return (
        id.includes(searchLower) ||
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        subdomain.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [companies, searchTerm]);

  // Calculate pagination based on filtered results
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCompanies.slice(startIndex, endIndex);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  // Reset to page 1 when items per page or search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  if (loading) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('CompaniesListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('CompaniesListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchCompanies}>
          <FaRedo /> {t('GridView_RetryButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('CompaniesListPage_Title')}</h1>
        <p className="page-subtitle">{t('CompaniesListPage_Subtitle')}</p>
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
                  placeholder={t('GridView  _SearchPlaceholder')}
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
                onClick={() => navigate('/company/create')}
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
                  <th>{t('Label_Email')}</th>
                  <th>{t('Label_Subdomain')}</th>
                  <th>{t('Label_Status')}</th>
                  <th>{t('Label_CreatedDate')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies.map(company => (
                    <tr key={company.id}>
                      <td>{company.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">
                          {company.nameTranslationKey || 'N/A'}
                        </div>
                      </td>
                      <td>{company.email || 'N/A'}</td>
                      <td>{company.subdomain || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${company.isActive ? 'active' : 'inactive'}`}>
                          {company.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td>
                        {company.creationDate
                          ? new Date(company.creationDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(company.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(company.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(company.id!)}
                            disabled={deletingId === company.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === company.id ?
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
          {filteredCompanies.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCompanies.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="companies"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompaniesList;

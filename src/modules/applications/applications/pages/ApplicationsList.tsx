import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    id: 100,
    name: 200,
    client: 150,
    companyId: 120,
    status: 120,
    createdDate: 150,
    actions: 280
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);

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
    if (!window.confirm(t('Button_DeletePopupConfirmation'))) {
      return;
    }

    try {
      setDeletingId(applicationId);
      await apiClient.deleteApiApplicationsV1(applicationId);
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
    let filtered = applications;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = applications.filter(app => {
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
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortColumn) {
          case 'id':
            aValue = a.id ?? 0;
            bValue = b.id ?? 0;
            break;
          case 'name':
            aValue = (a.nameTranslationKey || '').toLowerCase();
            bValue = (b.nameTranslationKey || '').toLowerCase();
            break;
          case 'client':
            aValue = (a.applicationClient || '').toLowerCase();
            bValue = (b.applicationClient || '').toLowerCase();
            break;
          case 'companyId':
            aValue = a.companyId ?? 0;
            bValue = b.companyId ?? 0;
            break;
          case 'status':
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
            break;
          case 'createdDate':
            aValue = a.creationDate ? new Date(a.creationDate).getTime() : 0;
            bValue = b.creationDate ? new Date(b.creationDate).getTime() : 0;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [applications, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <FaSort className="sort-icon" />;
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="sort-icon sort-active" />
      : <FaSortDown className="sort-icon sort-active" />;
  };

  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(column);
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = columnWidths[column] || 100;
  };

  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const diff = e.clientX - resizeStartXRef.current;
    const newWidth = Math.max(50, resizeStartWidthRef.current + diff);
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  }, [resizingColumn]);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizingColumn, handleResize, handleResizeEnd]);

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
          <FaRedo /> {t('Button_Retry')}
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
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('id');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Id')}
                      {getSortIcon('id')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'id')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('name');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Name')}
                      {getSortIcon('name')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'name')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.client, minWidth: columnWidths.client, maxWidth: columnWidths.client }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('client');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Client')}
                      {getSortIcon('client')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'client')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.companyId, minWidth: columnWidths.companyId, maxWidth: columnWidths.companyId }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('companyId');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_CompanyId')}
                      {getSortIcon('companyId')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'companyId')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('status');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Status')}
                      {getSortIcon('status')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'status')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.createdDate, minWidth: columnWidths.createdDate, maxWidth: columnWidths.createdDate }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('createdDate');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_CreatedDate')}
                      {getSortIcon('createdDate')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'createdDate')}
                    />
                  </th>
                  <th 
                    className="actions-column resizable" 
                    style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}
                  >
                    {t('Label_Actions')}
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'actions')}
                    />
                  </th>
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
                      <td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{app.id}</td>
                      <td className="name-cell" style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}>
                        <div className="cell-content">
                          {app.nameTranslationKey || 'N/A'}
                        </div>
                      </td>
                      <td style={{ width: columnWidths.client, minWidth: columnWidths.client, maxWidth: columnWidths.client }}>{app.applicationClient || 'N/A'}</td>
                      <td style={{ width: columnWidths.companyId, minWidth: columnWidths.companyId, maxWidth: columnWidths.companyId }}>{app.companyId ?? 'N/A'}</td>
                      <td style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}>
                        <span className={`status-badge ${app.isActive ? 'active' : 'inactive'}`}>
                          {app.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td style={{ width: columnWidths.createdDate, minWidth: columnWidths.createdDate, maxWidth: columnWidths.createdDate }}>
                        {app.creationDate
                          ? new Date(app.creationDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
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



import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralTypeGroupDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const GeneralTypeGroupsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [groups, setGroups] = useState<GeneralTypeGroupDTO[]>([]);
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
    systemType: 150,
    actions: 280
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiMasterV1GeneralTypeGroupsAll();
      setGroups(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load general type groups';
      setError(errorMessage);
      console.error('Error fetching general type groups:', err);
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
        fetchGroups();
      }
    };

    initializeCulture();
  }, [fetchGroups]);

  const handleDelete = async (groupId: number) => {
    if (!window.confirm(t('GeneralTypeGroupsListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(groupId);
      await apiClient.deleteApiMasterV1GeneralTypeGroupsDelete(groupId);
      await fetchGroups();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete general type group';
      alert(errorMessage);
      console.error('Error deleting general type group:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (groupId: number) => {
    navigate(`/general-type-group/view/${groupId}`);
  };

  const handleEdit = (groupId: number) => {
    navigate(`/general-type-group/edit/${groupId}`);
  };

  const filteredGroups = useMemo(() => {
    let filtered = groups;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = groups.filter(g => {
        const id = g.id?.toString() || '';
        const name = g.nameTranslationKey?.toLowerCase() || '';
        const system = g.isSystemType ? 'system' : 'custom';
        return (
          id.includes(searchLower) ||
          name.includes(searchLower) ||
          system.includes(searchLower)
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
          case 'systemType':
            aValue = a.isSystemType ? 1 : 0;
            bValue = b.isSystemType ? 1 : 0;
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
  }, [groups, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGroups.slice(startIndex, endIndex);
  }, [filteredGroups, currentPage, itemsPerPage]);

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
          <h1>{t('GeneralTypeGroupsListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('GeneralTypeGroupsListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchGroups}>
          <FaRedo /> {t('Button_Retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('GeneralTypeGroupsListPage_Title')}</h1>
        <p className="page-subtitle">{t('GeneralTypeGroupsListPage_Subtitle')}</p>
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
                onClick={() => navigate('/general-type-group/create')}
                title={t('Button_New_Tooltip')}
              >
                <FaPlus /> {t('Button_New')}
              </button>
            </div>
            {searchTerm && <div className="-results-infosearch"></div>}
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
                    style={{ width: columnWidths.systemType, minWidth: columnWidths.systemType, maxWidth: columnWidths.systemType }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('systemType');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_SystemType')}
                      {getSortIcon('systemType')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'systemType')}
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
                {paginatedGroups.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedGroups.map(group => (
                    <tr key={group.id}>
                      <td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{group.id}</td>
                      <td className="name-cell" style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}>
                        <div className="cell-content">{t(group.nameTranslationKey || 'N/A')}</div>
                      </td>
                      <td style={{ width: columnWidths.systemType, minWidth: columnWidths.systemType, maxWidth: columnWidths.systemType }}>
                        <span className={`status-badge ${group.isSystemType ? 'active' : 'inactive'}`}>
                          {group.isSystemType ? t('Label_Yes') : t('Label_No')}
                        </span>
                      </td>
                      <td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(group.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(group.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(group.id!)}
                            disabled={deletingId === group.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === group.id ? t('Button_Deleting') : t('Button_Delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredGroups.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredGroups.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="general type groups"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralTypeGroupsList;



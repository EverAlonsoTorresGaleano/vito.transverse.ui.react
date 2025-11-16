import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const EntitiesList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [entities, setEntities] = useState<EntityDTO[]>([]);
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
    schema: 150,
    entity: 200,
    status: 120,
    system: 120,
    actions: 280
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);

  const fetchEntities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiAuditoriesV1EntitiesAll();
      setEntities(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load entities';
      setError(errorMessage);
      console.error('Error fetching entities:', err);
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
        fetchEntities();
      }
    };

    initializeCulture();
  }, [fetchEntities]);

  const handleDelete = async (entityId: number) => {
    if (!window.confirm(t('EntitiesListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(entityId);
      await apiClient.deleteApiAuditoriesV1EntitiesDelete(entityId);
      await fetchEntities();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entity';
      alert(errorMessage);
      console.error('Error deleting entity:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (entityId: number) => {
    navigate(`/entity/view/${entityId}`);
  };

  const handleEdit = (entityId: number) => {
    navigate(`/entity/edit/${entityId}`);
  };

  const filteredEntities = useMemo(() => {
    let filtered = entities;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = entities.filter(entity => {
        const id = entity.id?.toString() || '';
        const schemaName = entity.schemaName?.toLowerCase() || '';
        const entityName = entity.entityName?.toLowerCase() || '';
        const status = entity.isActive ? 'active' : 'inactive';
        const system = entity.isSystemEntity ? 'system' : 'custom';

        return (
          id.includes(searchLower) ||
          schemaName.includes(searchLower) ||
          entityName.includes(searchLower) ||
          status.includes(searchLower) ||
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
          case 'schema':
            aValue = (a.schemaName || '').toLowerCase();
            bValue = (b.schemaName || '').toLowerCase();
            break;
          case 'entity':
            aValue = (a.entityName || '').toLowerCase();
            bValue = (b.entityName || '').toLowerCase();
            break;
          case 'status':
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
            break;
          case 'system':
            aValue = a.isSystemEntity ? 1 : 0;
            bValue = b.isSystemEntity ? 1 : 0;
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
  }, [entities, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const paginatedEntities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEntities.slice(startIndex, endIndex);
  }, [filteredEntities, currentPage, itemsPerPage]);

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
          <h1>{t('EntitiesListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('EntitiesListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchEntities}>
          <FaRedo /> {t('Button_Retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('EntitiesListPage_Title')}</h1>
        <p className="page-subtitle">{t('EntitiesListPage_Subtitle')}</p>
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
                onClick={() => navigate('/entity/create')}
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
                    style={{ width: columnWidths.schema, minWidth: columnWidths.schema, maxWidth: columnWidths.schema }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('schema');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Schema')}
                      {getSortIcon('schema')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'schema')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.entity, minWidth: columnWidths.entity, maxWidth: columnWidths.entity }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('entity');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Entity')}
                      {getSortIcon('entity')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'entity')}
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
                    style={{ width: columnWidths.system, minWidth: columnWidths.system, maxWidth: columnWidths.system }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('system');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_System')}
                      {getSortIcon('system')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'system')}
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
                {paginatedEntities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedEntities.map(entity => (
                    <tr key={entity.id}>
                      <td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{entity.id}</td>
                      <td className="name-cell" style={{ width: columnWidths.schema, minWidth: columnWidths.schema, maxWidth: columnWidths.schema }}>
                        <div className="cell-content">
                          {entity.schemaName || 'N/A'}
                        </div>
                      </td>
                      <td style={{ width: columnWidths.entity, minWidth: columnWidths.entity, maxWidth: columnWidths.entity }}>{entity.entityName || 'N/A'}</td>
                      <td style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}>
                        <span className={`status-badge ${entity.isActive ? 'active' : 'inactive'}`}>
                          {entity.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td style={{ width: columnWidths.system, minWidth: columnWidths.system, maxWidth: columnWidths.system }}>
                        {entity.isSystemEntity ? t('Label_Yes') : t('Label_No')}
                      </td>
                      <td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(entity.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(entity.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(entity.id!)}
                            disabled={deletingId === entity.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === entity.id ?
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
          {filteredEntities.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredEntities.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="entities"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EntitiesList;



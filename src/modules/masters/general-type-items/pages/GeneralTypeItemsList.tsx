import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralTypeItemDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const GeneralTypeItemsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState<GeneralTypeItemDTO[]>([]);
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
    group: 200,
    orderIndex: 120,
    status: 120,
    actions: 280
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiMasterV1GeneralTypeItemsAll();
      setItems(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load general type items';
      setError(errorMessage);
      console.error('Error fetching general type items:', err);
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
        fetchItems();
      }
    };

    initializeCulture();
  }, [fetchItems]);

  const handleDelete = async (itemId: number) => {
    if (!window.confirm(t('GeneralTypeItemsListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(itemId);
      await apiClient.deleteApiMasterV1GeneralTypeItemsDelete(itemId);
      await fetchItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete general type item';
      alert(errorMessage);
      console.error('Error deleting general type item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (itemId: number) => {
    navigate(`/general-type-item/view/${itemId}`);
  };

  const handleEdit = (itemId: number) => {
    navigate(`/general-type-item/edit/${itemId}`);
  };

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = items.filter(i => {
        const id = i.id?.toString() || '';
        const name = i.nameTranslationKey?.toLowerCase() || '';
        const groupName = i.itemGroupNameTranslationKey?.toLowerCase() || '';
        const status = i.isEnabled ? 'active' : 'inactive';
        const orderIdx = i.orderIndex?.toString() || '';
        return (
          id.includes(searchLower) ||
          name.includes(searchLower) ||
          groupName.includes(searchLower) ||
          status.includes(searchLower) ||
          orderIdx.includes(searchLower)
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
          case 'group':
            aValue = (a.itemGroupNameTranslationKey || '').toLowerCase();
            bValue = (b.itemGroupNameTranslationKey || '').toLowerCase();
            break;
          case 'orderIndex':
            aValue = a.orderIndex ?? 0;
            bValue = b.orderIndex ?? 0;
            break;
          case 'status':
            aValue = a.isEnabled ? 1 : 0;
            bValue = b.isEnabled ? 1 : 0;
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
  }, [items, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset to page 1 when items per page, search term, or sort changes
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
          <h1>{t('GeneralTypeItemsListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('GeneralTypeItemsListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchItems}>
          <FaRedo /> {t('Button_Retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('GeneralTypeItemsListPage_Title')}</h1>
        <p className="page-subtitle">{t('GeneralTypeItemsListPage_Subtitle')}</p>
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
                onClick={() => navigate('/general-type-item/create')}
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
                    style={{ width: columnWidths.group, minWidth: columnWidths.group, maxWidth: columnWidths.group }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('group');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Group')}
                      {getSortIcon('group')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'group')}
                    />
                  </th>
                  <th 
                    className="sortable resizable" 
                    style={{ width: columnWidths.orderIndex, minWidth: columnWidths.orderIndex, maxWidth: columnWidths.orderIndex }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('orderIndex');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_OrderIndex')}
                      {getSortIcon('orderIndex')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'orderIndex')}
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
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{item.id}</td>
                      <td className="name-cell" style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}>
                        <div className="cell-content">{t(item.nameTranslationKey || 'N/A')}</div>
                      </td>
                      <td style={{ width: columnWidths.group, minWidth: columnWidths.group, maxWidth: columnWidths.group }}>{t( item.itemGroupNameTranslationKey || 'N/A') || item.listItemGroupFk || 'N/A'}</td>
                      <td style={{ width: columnWidths.orderIndex, minWidth: columnWidths.orderIndex, maxWidth: columnWidths.orderIndex }}>{item.orderIndex ?? 'N/A'}</td>
                      <td style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}>
                        <span className={`status-badge ${item.isEnabled ? 'active' : 'inactive'}`}>
                          {item.isEnabled ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(item.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(item.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(item.id!)}
                            disabled={deletingId === item.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === item.id ? t('Button_Deleting') : t('Button_Delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredItems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredItems.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="general type items"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralTypeItemsList;



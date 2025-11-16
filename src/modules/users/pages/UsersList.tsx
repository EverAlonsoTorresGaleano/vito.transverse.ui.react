import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Pagination from '../../../components/Pagination/Pagination';
import { apiClient } from '../../../services/apiService';
import { UserDTO } from '../../../api/vito-transverse-identity-api';
import '../../../styles/CompaniesList.css';
import config from '../../../config';
import { translationService } from '../../../services/translationService';
const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserDTO[]>([]);
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
    username: 150,
    name: 200,
    email: 200,
    status: 120,
    actions: 280
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);
 
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiUsersV1All();
      setUsers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
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
        fetchUsers();
      }
    };

    initializeCulture();
  }, [fetchUsers]);

  const handleDelete = async (userId: number) => {
    if (!window.confirm(t('UsersListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(userId);
      await apiClient.deleteApiUsersV1Delete(userId);
      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_DeleteError');
      alert(errorMessage);
      console.error('Error deleting user:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (userId: number) => {
    navigate(`/user/view/${userId}`);
  };

  const handleEdit = (userId: number) => {
    navigate(`/user/edit/${userId}`);
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = users.filter(u => {
        const id = u.id?.toString() || '';
        const name = `${u.name || ''} ${u.lastName || ''}`.toLowerCase();
        const email = u.email?.toLowerCase() || '';
        const userName = u.userName?.toLowerCase() || '';
        const status = u.isActive ? 'active' : 'inactive';
        return (
          id.includes(searchLower) ||
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          userName.includes(searchLower) ||
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
          case 'username':
            aValue = (a.userName || '').toLowerCase();
            bValue = (b.userName || '').toLowerCase();
            break;
          case 'name':
            aValue = `${a.name || ''} ${a.lastName || ''}`.toLowerCase();
            bValue = `${b.name || ''} ${b.lastName || ''}`.toLowerCase();
            break;
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
            break;
          case 'status':
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
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
  }, [users, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

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
          <h1>{t('UsersListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('UsersListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchUsers}>
          <FaRedo /> {t('Button_Retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('UsersListPage_Title')}</h1>
        <p className="page-subtitle">{t('UsersListPage_Subtitle')}</p>
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
                onClick={() => navigate('/user/create')}
                title={t('Button_New_Tooltip')}
              >
                <FaPlus /> {t('Button_New')}
              </button>
            </div>
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
                    style={{ width: columnWidths.username, minWidth: columnWidths.username, maxWidth: columnWidths.username }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('username');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Username')}
                      {getSortIcon('username')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'username')}
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
                    style={{ width: columnWidths.email, minWidth: columnWidths.email, maxWidth: columnWidths.email }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.classList.contains('resize-handle')) {
                        handleSort('email');
                      }
                    }}
                  >
                    <div className="sortable-header">
                      {t('Label_Email')}
                      {getSortIcon('email')}
                    </div>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'email')}
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
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{u.id}</td>
                      <td style={{ width: columnWidths.username, minWidth: columnWidths.username, maxWidth: columnWidths.username }}>{u.userName || 'N/A'}</td>
                      <td style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}>{`${u.name || ''} ${u.lastName || ''}`.trim() || 'N/A'}</td>
                      <td style={{ width: columnWidths.email, minWidth: columnWidths.email, maxWidth: columnWidths.email }}>{u.email || 'N/A'}</td>
                      <td style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}>
                        <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(u.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(u.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(u.id!)}
                            disabled={deletingId === u.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === u.id ? t('Button_Deleting') : t('Button_Delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="users"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersList;




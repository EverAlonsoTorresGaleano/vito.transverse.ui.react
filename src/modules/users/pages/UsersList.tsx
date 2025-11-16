import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
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
    if (!searchTerm.trim()) {
      return users;
    }
    const q = searchTerm.toLowerCase().trim();
    return users.filter(u => {
      const id = u.id?.toString() || '';
      const name = `${u.name || ''} ${u.lastName || ''}`.toLowerCase();
      const email = u.email?.toLowerCase() || '';
      const userName = u.userName?.toLowerCase() || '';
      const status = u.isActive ? 'active' : 'inactive';
      return (
        id.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        userName.includes(q) ||
        status.includes(q)
      );
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  if (loading) {
    return (
      <div className="list-page">
        <div className="page-header">
          <h1>{t('UsersListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page">
        <div className="page-header">
          <h1>{t('UsersListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchUsers}>
          <FaRedo /> {t('GridView_RetryButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page">
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
                  <th>{t('Label_Id')}</th>
                  <th>{t('Label_Username')}</th>
                  <th>{t('Label_Name')}</th>
                  <th>{t('Label_Email')}</th>
                  <th>{t('Label_Status')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
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
                      <td>{u.id}</td>
                      <td>{u.userName || 'N/A'}</td>
                      <td>{`${u.name || ''} ${u.lastName || ''}`.trim() || 'N/A'}</td>
                      <td>{u.email || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td className="actions-cell">
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




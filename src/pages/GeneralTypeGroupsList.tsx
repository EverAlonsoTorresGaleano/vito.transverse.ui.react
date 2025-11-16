import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralTypeGroupDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { translationService } from '../services/translationService';

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
    if (!searchTerm.trim()) {
      return groups;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return groups.filter(g => {
      const id = g.id?.toString() || '';
      const name = g.nameTranslationKey?.toLowerCase() || '';
      const system = g.isSystemType ? 'system' : 'custom';
      return (
        id.includes(searchLower) ||
        name.includes(searchLower) ||
        system.includes(searchLower)
      );
    });
  }, [groups, searchTerm]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGroups.slice(startIndex, endIndex);
  }, [filteredGroups, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

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
          <FaRedo /> {t('GridView_RetryButton')}
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
                  <th>{t('Label_Id')}</th>
                  <th>{t('Label_Name')}</th>
                  <th>{t('Label_SystemType')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
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
                      <td>{group.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">{group.nameTranslationKey || 'N/A'}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${group.isSystemType ? 'active' : 'inactive'}`}>
                          {group.isSystemType ? t('Label_Yes') : t('Label_No')}
                        </span>
                      </td>
                      <td className="actions-cell">
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



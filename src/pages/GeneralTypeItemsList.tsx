import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralTypeItemDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { translationService } from '../services/translationService';

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
    if (!searchTerm.trim()) {
      return items;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return items.filter(i => {
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
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

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
          <FaRedo /> {t('GridView_RetryButton')}
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
                  <th>{t('Label_Id')}</th>
                  <th>{t('Label_Name')}</th>
                  <th>{t('Label_Group')}</th>
                  <th>{t('Label_OrderIndex')}</th>
                  <th>{t('Label_Status')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
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
                      <td>{item.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">{item.nameTranslationKey || 'N/A'}</div>
                      </td>
                      <td>{item.itemGroupNameTranslationKey || item.listItemGroupFk || 'N/A'}</td>
                      <td>{item.orderIndex ?? 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${item.isEnabled ? 'active' : 'inactive'}`}>
                          {item.isEnabled ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td className="actions-cell">
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



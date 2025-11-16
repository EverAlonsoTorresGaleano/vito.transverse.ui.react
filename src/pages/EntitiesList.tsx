import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { translationService } from '../services/translationService';

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
    if (!searchTerm.trim()) {
      return entities;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return entities.filter(entity => {
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
  }, [entities, searchTerm]);

  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const paginatedEntities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEntities.slice(startIndex, endIndex);
  }, [filteredEntities, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

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
          <FaRedo /> {t('GridView_RetryButton')}
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
                  <th>{t('Label_Id')}</th>
                  <th>{t('Label_Schema')}</th>
                  <th>{t('Label_Entity')}</th>
                  <th>{t('Label_Status')}</th>
                  <th>{t('Label_System')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
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
                      <td>{entity.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">
                          {entity.schemaName || 'N/A'}
                        </div>
                      </td>
                      <td>{entity.entityName || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${entity.isActive ? 'active' : 'inactive'}`}>
                          {entity.isActive ? t('Label_Active') : t('Label_Inactive')}
                        </span>
                      </td>
                      <td>
                        {entity.isSystemEntity ? t('Label_Yes') : t('Label_No')}
                      </td>
                      <td className="actions-cell">
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



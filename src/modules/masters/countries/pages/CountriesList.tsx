import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountryDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const CountriesList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentCulture, setCurrentCulture] = useState<string>('');

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiMasterV1CountriesAll();
      setCountries(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load countries';
      setError(errorMessage);
      console.error('Error fetching countries:', err);
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
        fetchCountries();
      }
    };

    initializeCulture();
  }, [fetchCountries]);

  const handleDelete = async (countryId: string) => {
    if (!window.confirm(t('CountriesListPage_DeleteConfirmation'))) {
      return;
    }

    try {
      setDeletingId(countryId);
      await apiClient.deleteApiMasterV1CountriesDelete(countryId);
      await fetchCountries();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete country';
      alert(errorMessage);
      console.error('Error deleting country:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (countryId: string) => {
    navigate(`/country/view/${countryId}`);
  };

  const handleEdit = (countryId: string) => {
    navigate(`/country/edit/${countryId}`);
  };

  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) {
      return countries;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return countries.filter(country => {
      const id = (country.id || '').toLowerCase();
      const name = (country.nameTranslationKey || '').toLowerCase();
      const utc = (country.utcHoursDifference ?? '').toString();
      return (
        id.includes(searchLower) ||
        name.includes(searchLower) ||
        utc.includes(searchLower)
      );
    });
  }, [countries, searchTerm]);

  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCountries.slice(startIndex, endIndex);
  }, [filteredCountries, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  if (loading) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('CountriesListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page" data-current-culture={currentCulture || undefined}>
        <div className="page-header">
          <h1>{t('CountriesListPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchCountries}>
          <FaRedo /> {t('GridView_RetryButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="list-page" data-current-culture={currentCulture || undefined}>
      <div className="page-header">
        <h1>{t('CountriesListPage_Title')}</h1>
        <p className="page-subtitle">{t('CountriesListPage_Subtitle')}</p>
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
                onClick={() => navigate('/country/create')}
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
                  <th>{t('Label_UtcHoursDifference')}</th>
                  <th className="actions-column">{t('Label_Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCountries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      {searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedCountries.map(country => (
                    <tr key={country.id}>
                      <td>{country.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">
                          {country.nameTranslationKey || 'N/A'}
                        </div>
                      </td>
                      <td>{country.utcHoursDifference ?? 'N/A'}</td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(country.id!)}
                            title={t('Button_View_Tooltip')}
                          >
                            <FaEye /> {t('Button_View')}
                          </button>
                          <button
                            className="action-button secondary-button"
                            onClick={() => handleEdit(country.id!)}
                            title={t('Button_Edit_Tooltip')}
                          >
                            <FaEdit /> {t('Button_Edit')}
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(country.id!)}
                            disabled={deletingId === country.id}
                            title={t('Button_Delete_Tooltip')}
                          >
                            <FaTrash /> {deletingId === country.id ?
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
          {filteredCountries.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCountries.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="countries"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CountriesList;



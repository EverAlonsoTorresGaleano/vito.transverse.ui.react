import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { translationService } from '../services/translationService';

const LanguagesList: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [languages, setLanguages] = useState<LanguageDTO[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [currentCulture, setCurrentCulture] = useState<string>('');

	const fetchLanguages = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiClient.getApiMasterV1LanguagesAll();
			setLanguages(data || []);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load languages';
			setError(errorMessage);
			console.error('Error fetching languages:', err);
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
				fetchLanguages();
			}
		};

		initializeCulture();
	}, [fetchLanguages]);

	const handleDelete = async (languageId: string) => {
		if (!window.confirm(t('LanguagesListPage_DeleteConfirmation'))) {
		 return;
		}

		try {
			setDeletingId(languageId);
			await apiClient.deleteApiMasterV1LanguagesDelete(languageId);
			await fetchLanguages();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete language';
			alert(errorMessage);
			console.error('Error deleting language:', err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleView = (languageId: string) => {
		navigate(`/language/view/${languageId}`);
	};

	const handleEdit = (languageId: string) => {
		navigate(`/language/edit/${languageId}`);
	};

	const filteredLanguages = useMemo(() => {
		if (!searchTerm.trim()) {
			return languages;
		}
		const searchLower = searchTerm.toLowerCase().trim();
		return languages.filter(lang => {
			const id = (lang.id || '').toLowerCase();
			const name = (lang.nameTranslationKey || '').toLowerCase();
			return id.includes(searchLower) || name.includes(searchLower);
		});
	}, [languages, searchTerm]);

	const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage);
	const paginatedLanguages = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredLanguages.slice(startIndex, endIndex);
	}, [filteredLanguages, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [itemsPerPage, searchTerm]);

	if (loading) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('LanguagesListPage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('LanguagesListPage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="retry-button" onClick={fetchLanguages}>
					<FaRedo /> {t('GridView_RetryButton')}
				</button>
			</div>
		);
	}

	return (
		<div className="list-page" data-current-culture={currentCulture || undefined}>
			<div className="page-header">
				<h1>{t('LanguagesListPage_Title')}</h1>
				<p className="page-subtitle">{t('LanguagesListPage_Subtitle')}</p>
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
								onClick={() => navigate('/language/create')}
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
									<th className="actions-column">{t('Label_Actions')}</th>
								</tr>
							</thead>
							<tbody>
								{paginatedLanguages.length === 0 ? (
									<tr>
										<td colSpan={3} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedLanguages.map(lang => (
										<tr key={lang.id}>
											<td>{lang.id}</td>
											<td className="name-cell">
												<div className="cell-content">
													{lang.nameTranslationKey || 'N/A'}
												</div>
											</td>
											<td className="actions-cell">
												<div className="action-buttons">
													<button
														className="action-button view-button"
														onClick={() => handleView(lang.id!)}
														title={t('Button_View_Tooltip')}
													>
														<FaEye /> {t('Button_View')}
													</button>
													<button
														className="action-button secondary-button"
														onClick={() => handleEdit(lang.id!)}
														title={t('Button_Edit_Tooltip')}
													>
														<FaEdit /> {t('Button_Edit')}
													</button>
													<button
														className="action-button delete-button"
														onClick={() => handleDelete(lang.id!)}
														disabled={deletingId === lang.id}
														title={t('Button_Delete_Tooltip')}
													>
														<FaTrash /> {deletingId === lang.id ?
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
					{filteredLanguages.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							itemsPerPage={itemsPerPage}
							totalItems={filteredLanguages.length}
							onItemsPerPageChange={setItemsPerPage}
							itemName="languages"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default LanguagesList;



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CultureDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const CulturesList: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [cultures, setCultures] = useState<CultureDTO[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [currentCulture, setCurrentCulture] = useState<string>('');

	const fetchCultures = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiClient.getApiMasterV1CulturesAll();
			setCultures(data || []);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load cultures';
			setError(errorMessage);
			console.error('Error fetching cultures:', err);
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
				fetchCultures();
			}
		};

		initializeCulture();
	}, [fetchCultures]);

	const handleDelete = async (cultureId: string) => {
		if (!window.confirm(t('CulturesListPage_DeleteConfirmation'))) {
			return;
		}

		try {
			setDeletingId(cultureId);
			await apiClient.deleteApiMasterV1CulturesDelete(cultureId);
			await fetchCultures();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete culture';
			alert(errorMessage);
			console.error('Error deleting culture:', err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleView = (cultureId: string) => {
		navigate(`/culture/view/${cultureId}`);
	};

	const handleEdit = (cultureId: string) => {
		navigate(`/culture/edit/${cultureId}`);
	};

	const filteredCultures = useMemo(() => {
		if (!searchTerm.trim()) {
			return cultures;
		}
		const searchLower = searchTerm.toLowerCase().trim();
		return cultures.filter(c => {
			const id = (c.id || '').toLowerCase();
			const name = (c.nameTranslationKey || c.name || '').toLowerCase();
			const country = (c.countryFk || '').toLowerCase();
			const language = (c.languageFk || '').toLowerCase();
			const enabled = c.isEnabled ? 'true' : 'false';
			return (
				id.includes(searchLower) ||
				name.includes(searchLower) ||
				country.includes(searchLower) ||
				language.includes(searchLower) ||
				enabled.includes(searchLower)
			);
		});
	}, [cultures, searchTerm]);

	const totalPages = Math.ceil(filteredCultures.length / itemsPerPage);
	const paginatedCultures = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredCultures.slice(startIndex, endIndex);
	}, [filteredCultures, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [itemsPerPage, searchTerm]);

	if (loading) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('CulturesListPage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('CulturesListPage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="retry-button" onClick={fetchCultures}>
					<FaRedo /> {t('GridView_RetryButton')}
				</button>
			</div>
		);
	}

	return (
		<div className="list-page" data-current-culture={currentCulture || undefined}>
			<div className="page-header">
				<h1>{t('CulturesListPage_Title')}</h1>
				<p className="page-subtitle">{t('CulturesListPage_Subtitle')}</p>
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
								onClick={() => navigate('/culture/create')}
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
									<th>{t('Label_Country')}</th>
									<th>{t('Label_Language')}</th>
									<th>{t('Label_Enabled')}</th>
									<th className="actions-column">{t('Label_Actions')}</th>
								</tr>
							</thead>
							<tbody>
								{paginatedCultures.length === 0 ? (
									<tr>
										<td colSpan={6} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedCultures.map(c => (
										<tr key={c.id}>
											<td>{c.id}</td>
											<td className="name-cell">
												<div className="cell-content">
													{c.nameTranslationKey || c.name || 'N/A'}
												</div>
											</td>
											<td>{c.countryFk || 'N/A'}</td>
											<td>{c.languageFk || 'N/A'}</td>
											<td>
												<span className={`status-badge ${c.isEnabled ? 'active' : 'inactive'}`}>
													{c.isEnabled ? t('Label_Yes') : t('Label_No')}
												</span>
											</td>
											<td className="actions-cell">
												<div className="action-buttons">
													<button
														className="action-button view-button"
														onClick={() => handleView(c.id!)}
														title={t('Button_View_Tooltip')}
													>
														<FaEye /> {t('Button_View')}
													</button>
													<button
														className="action-button secondary-button"
														onClick={() => handleEdit(c.id!)}
														title={t('Button_Edit_Tooltip')}
													>
														<FaEdit /> {t('Button_Edit')}
													</button>
													<button
														className="action-button delete-button"
														onClick={() => handleDelete(c.id!)}
														disabled={deletingId === c.id}
														title={t('Button_Delete_Tooltip')}
													>
														<FaTrash /> {deletingId === c.id ?
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
					{filteredCultures.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							itemsPerPage={itemsPerPage}
							totalItems={filteredCultures.length}
							onItemsPerPageChange={setItemsPerPage}
							itemName="cultures"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default CulturesList;




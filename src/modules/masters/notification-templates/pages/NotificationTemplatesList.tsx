import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationTemplateDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const NotificationTemplatesList: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [templates, setTemplates] = useState<NotificationTemplateDTO[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [currentCulture, setCurrentCulture] = useState<string>('');

	const fetchTemplates = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiClient.getApiMasterV1NotificationTemplatesAll();
			setTemplates(data || []);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
			setError(errorMessage);
			console.error('Error fetching templates:', err);
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
				fetchTemplates();
			}
		};

		initializeCulture();
	}, [fetchTemplates]);

	const handleDelete = async (templateId: number) => {
	if (!window.confirm(t('NotificationTemplatesListPage_DeleteConfirmation'))) {
			return;
		}

		try {
			setDeletingId(templateId);
			await apiClient.deleteApiMasterV1NotificationTemplatesDelete(templateId);
			await fetchTemplates();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
			alert(errorMessage);
			console.error('Error deleting template:', err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleView = (templateId: number) => {
		navigate(`/notification-template/view/${templateId}`);
	};

	const handleEdit = (templateId: number) => {
		navigate(`/notification-template/edit/${templateId}`);
	};

	const filteredTemplates = useMemo(() => {
		if (!searchTerm.trim()) {
			return templates;
		}
		const searchLower = searchTerm.toLowerCase().trim();
		return templates.filter(tpl => {
			const id = (tpl.id?.toString() || '').toLowerCase();
			const name = (tpl.name || '').toLowerCase();
			const subject = (tpl.subjectTemplateText || '').toLowerCase();
			const culture = (tpl.cultureFk || '').toLowerCase();
			return (
				id.includes(searchLower) ||
				name.includes(searchLower) ||
				subject.includes(searchLower) ||
				culture.includes(searchLower)
			);
		});
	}, [templates, searchTerm]);

	const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
	const paginatedTemplates = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredTemplates.slice(startIndex, endIndex);
	}, [filteredTemplates, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [itemsPerPage, searchTerm]);

	if (loading) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('NotificationTemplatesListPage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('NotificationTemplatesListPage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="retry-button" onClick={fetchTemplates}>
					<FaRedo /> {t('GridView_RetryButton')}
				</button>
			</div>
		);
	}

	return (
		<div className="list-page" data-current-culture={currentCulture || undefined}>
			<div className="page-header">
				<h1>{t('NotificationTemplatesListPage_Title')}</h1>
				<p className="page-subtitle">{t('NotificationTemplatesListPage_Subtitle')}</p>
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
								onClick={() => navigate('/notification-template/create')}
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
									<th>{t('Label_Subject')}</th>
									<th>{t('Label_Culture')}</th>
									<th className="actions-column">{t('Label_Actions')}</th>
								</tr>
							</thead>
							<tbody>
								{paginatedTemplates.length === 0 ? (
									<tr>
										<td colSpan={5} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedTemplates.map(tpl => (
										<tr key={tpl.id}>
											<td>{tpl.id}</td>
											<td className="name-cell">
												<div className="cell-content">
													{tpl.name || 'N/A'}
												</div>
											</td>
											<td>{tpl.subjectTemplateText || 'N/A'}</td>
											<td>{tpl.cultureFk || 'N/A'}</td>
											<td className="actions-cell">
												<div className="action-buttons">
													<button
														className="action-button view-button"
														onClick={() => handleView(tpl.id!)}
														title={t('Button_View_Tooltip')}
													>
														<FaEye /> {t('Button_View')}
													</button>
													<button
														className="action-button secondary-button"
														onClick={() => handleEdit(tpl.id!)}
														title={t('Button_Edit_Tooltip')}
													>
														<FaEdit /> {t('Button_Edit')}
													</button>
													<button
														className="action-button delete-button"
														onClick={() => handleDelete(tpl.id!)}
														disabled={deletingId === tpl.id}
														title={t('Button_Delete_Tooltip')}
													>
														<FaTrash /> {deletingId === tpl.id ?
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
					{filteredTemplates.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							itemsPerPage={itemsPerPage}
							totalItems={filteredTemplates.length}
							onItemsPerPageChange={setItemsPerPage}
							itemName="templates"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default NotificationTemplatesList;




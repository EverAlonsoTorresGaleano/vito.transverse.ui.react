import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyEntityAuditDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { translationService } from '../services/translationService';

const CompanyEntityAuditsList: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [audits, setAudits] = useState<CompanyEntityAuditDTO[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [currentCulture, setCurrentCulture] = useState<string>('');

	const fetchAudits = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			// API accepts companyId; pass null to fetch all
			const data = await apiClient.getApiAuditoriesV1CompanyEntityAuditsAll(null);
			setAudits(data || []);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load audits';
			setError(errorMessage);
			console.error('Error fetching audits:', err);
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
				fetchAudits();
			}
		};

		initializeCulture();
	}, [fetchAudits]);

	const handleDelete = async (auditId: number) => {
		if (!window.confirm(t('CompaniesListPage_DeleteConfirmation'))) {
			return;
		}

		try {
			setDeletingId(auditId);
			await apiClient.deleteApiAuditoriesV1CompanyEntityAuditsDelete(auditId);
			await fetchAudits();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete audit';
			alert(errorMessage);
			console.error('Error deleting audit:', err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleView = (auditId: number) => {
		navigate(`/company-entity-audit/view/${auditId}`);
	};

	const handleEdit = (auditId: number) => {
		navigate(`/company-entity-audit/edit/${auditId}`);
	};

	// Filter based on search term across key fields
	const filteredAudits = useMemo(() => {
		if (!searchTerm.trim()) {
			return audits;
		}

		const q = searchTerm.toLowerCase().trim();
		return audits.filter(a => {
			const id = a.id?.toString() || '';
			const company = a.companyNameTranslationKey?.toLowerCase() || '';
			const auditType = a.auditTypeNameTranslationKey?.toLowerCase() || '';
			const entityName = a.entityName?.toLowerCase() || '';
			const entitySchemaName = a.entitySchemaName?.toLowerCase() || '';
			const status = a.isActive ? 'active' : 'inactive';
			return (
				id.includes(q) ||
				company.includes(q) ||
				auditType.includes(q) ||
				entityName.includes(q) ||
				entitySchemaName.includes(q) ||
				status.includes(q)
			);
		});
	}, [audits, searchTerm]);

	// Pagination
	const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
	const paginatedAudits = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredAudits.slice(startIndex, endIndex);
	}, [filteredAudits, currentPage, itemsPerPage]);

	// Reset to page 1 when items per page or search term changes
	useEffect(() => {
		setCurrentPage(1);
	}, [itemsPerPage, searchTerm]);

	if (loading) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('CompanyEntityAuditsListPage_Title') || 'Company Entity Audits'}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('CompanyEntityAuditsListPage_Title') || 'Company Entity Audits'}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="retry-button" onClick={fetchAudits}>
					<FaRedo /> {t('GridView_RetryButton')}
				</button>
			</div>
		);
	}

	return (
		<div className="list-page" data-current-culture={currentCulture || undefined}>
			<div className="page-header">
				<h1>{t('CompanyEntityAuditsListPage_Title') || 'Company Entity Audits'}</h1>
				<p className="page-subtitle">{t('CompanyEntityAuditsListPage_Subtitle') || ''}</p>
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
								onClick={() => navigate('/company-entity-audit/create')}
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
									<th>{t('Label_Company')}</th>
									<th>{t('Label_EntitySchema')}</th>
									<th>{t('Label_EntityName')}</th>
									<th>{t('Label_AuditType')}</th>
									<th>{t('Label_Status')}</th>
									<th>{t('Label_CreatedDate')}</th>
									<th className="actions-column">{t('Label_Actions')}</th>
								</tr>
							</thead>
							<tbody>
								{paginatedAudits.length === 0 ? (
									<tr>
										<td colSpan={8} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedAudits.map(audit => (
										<tr key={audit.id}>
											<td>{audit.id}</td>
											<td className="name-cell">
												<div className="cell-content">
													{audit.companyNameTranslationKey || 'N/A'}
												</div>
											</td>
											<td>{audit.entitySchemaName || 'N/A'}</td>
											<td>{audit.entityName || 'N/A'}</td>
											<td>{audit.auditTypeNameTranslationKey || 'N/A'}</td>
											<td>
												<span className={`status-badge ${audit.isActive ? 'active' : 'inactive'}`}>
													{audit.isActive ? t('Label_Active') : t('Label_Inactive')}
												</span>
											</td>
											<td>
												{audit.creationDate
													? new Date(audit.creationDate).toLocaleDateString()
													: 'N/A'}
											</td>
											<td className="actions-cell">
												<div className="action-buttons">
													<button
														className="action-button view-button"
														onClick={() => handleView(audit.id!)}
														title={t('Button_View_Tooltip')}
													>
														<FaEye /> {t('Button_View')}
													</button>
													<button
														className="action-button secondary-button"
														onClick={() => handleEdit(audit.id!)}
														title={t('Button_Edit_Tooltip')}
													>
														<FaEdit /> {t('Button_Edit')}
													</button>
													<button
														className="action-button delete-button"
														onClick={() => handleDelete(audit.id!)}
														disabled={deletingId === audit.id}
														title={t('Button_Delete_Tooltip')}
													>
														<FaTrash /> {deletingId === audit.id ?
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
					{filteredAudits.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							itemsPerPage={itemsPerPage}
							totalItems={filteredAudits.length}
							onItemsPerPageChange={setItemsPerPage}
							itemName="audits"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default CompanyEntityAuditsList;



import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyEntityAuditDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

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
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
		id: 100,
		company: 200,
		entitySchema: 150,
		entityName: 180,
		auditType: 150,
		status: 120,
		createdDate: 150,
		actions: 280
	});
	const [resizingColumn, setResizingColumn] = useState<string | null>(null);
	const resizeStartXRef = useRef<number>(0);
	const resizeStartWidthRef = useRef<number>(0);

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
		if (!window.confirm(t('Button_DeletePopupConfirmation'))) {
			return;
		}

		try {
			setDeletingId(auditId);
			await apiClient.deleteApiAuditoriesV1CompanyEntityAudits(auditId);
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

	// Filter based on search term across key fields and apply sorting
	const filteredAudits = useMemo(() => {
		let filtered = audits;

		// Apply search filter
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase().trim();
			filtered = audits.filter(a => {
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
					case 'company':
						aValue = (a.companyNameTranslationKey || '').toLowerCase();
						bValue = (b.companyNameTranslationKey || '').toLowerCase();
						break;
					case 'entitySchema':
						aValue = (a.entitySchemaName || '').toLowerCase();
						bValue = (b.entitySchemaName || '').toLowerCase();
						break;
					case 'entityName':
						aValue = (a.entityName || '').toLowerCase();
						bValue = (b.entityName || '').toLowerCase();
						break;
					case 'auditType':
						aValue = (a.auditTypeNameTranslationKey || '').toLowerCase();
						bValue = (b.auditTypeNameTranslationKey || '').toLowerCase();
						break;
					case 'status':
						aValue = a.isActive ? 1 : 0;
						bValue = b.isActive ? 1 : 0;
						break;
					case 'createdDate':
						aValue = a.creationDate ? new Date(a.creationDate).getTime() : 0;
						bValue = b.creationDate ? new Date(b.creationDate).getTime() : 0;
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
	}, [audits, searchTerm, sortColumn, sortDirection]);

	// Pagination
	const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
	const paginatedAudits = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredAudits.slice(startIndex, endIndex);
	}, [filteredAudits, currentPage, itemsPerPage]);

	// Reset to page 1 when items per page, search term, or sort changes
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
					<FaRedo /> {t('Button_Retry')}
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
										style={{ width: columnWidths.company, minWidth: columnWidths.company, maxWidth: columnWidths.company }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('company');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Company')}
											{getSortIcon('company')}
										</div>
										<div
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'company')}
										/>
									</th>
									<th
										className="sortable resizable"
										style={{ width: columnWidths.entitySchema, minWidth: columnWidths.entitySchema, maxWidth: columnWidths.entitySchema }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('entitySchema');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_EntitySchema')}
											{getSortIcon('entitySchema')}
										</div>
										<div
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'entitySchema')}
										/>
									</th>
									<th
										className="sortable resizable"
										style={{ width: columnWidths.entityName, minWidth: columnWidths.entityName, maxWidth: columnWidths.entityName }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('entityName');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_EntityName')}
											{getSortIcon('entityName')}
										</div>
										<div
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'entityName')}
										/>
									</th>
									<th
										className="sortable resizable"
										style={{ width: columnWidths.auditType, minWidth: columnWidths.auditType, maxWidth: columnWidths.auditType }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('auditType');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_AuditType')}
											{getSortIcon('auditType')}
										</div>
										<div
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'auditType')}
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
										className="sortable resizable"
										style={{ width: columnWidths.createdDate, minWidth: columnWidths.createdDate, maxWidth: columnWidths.createdDate }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('createdDate');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_CreatedDate')}
											{getSortIcon('createdDate')}
										</div>
										<div
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'createdDate')}
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
								{paginatedAudits.length === 0 ? (
									<tr>
										<td colSpan={8} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedAudits.map(audit => (
										<tr key={audit.id}>
											<td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{audit.id}</td>
											<td className="name-cell" style={{ width: columnWidths.company, minWidth: columnWidths.company, maxWidth: columnWidths.company }}>
												<div className="cell-content">
													{audit.companyNameTranslationKey || 'N/A'}
												</div>
											</td>
											<td style={{ width: columnWidths.entitySchema, minWidth: columnWidths.entitySchema, maxWidth: columnWidths.entitySchema }}>{audit.entitySchemaName || 'N/A'}</td>
											<td style={{ width: columnWidths.entityName, minWidth: columnWidths.entityName, maxWidth: columnWidths.entityName }}>{audit.entityName || 'N/A'}</td>
											<td style={{ width: columnWidths.auditType, minWidth: columnWidths.auditType, maxWidth: columnWidths.auditType }}>{t(audit.auditTypeNameTranslationKey || 'N/A')}</td>
											<td style={{ width: columnWidths.status, minWidth: columnWidths.status, maxWidth: columnWidths.status }}>
												<span className={`status-badge ${audit.isActive ? 'active' : 'inactive'}`}>
													{audit.isActive ? t('Label_Active') : t('Label_Inactive')}
												</span>
											</td>
											<td style={{ width: columnWidths.createdDate, minWidth: columnWidths.createdDate, maxWidth: columnWidths.createdDate }}>
												{audit.creationDate
													? new Date(audit.creationDate).toLocaleDateString()
													: 'N/A'}
											</td>
											<td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
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



import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationTemplateDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
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
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
		id: 100,
		name: 200,
		subject: 250,
		culture: 150,
		actions: 280
	});
	const [resizingColumn, setResizingColumn] = useState<string | null>(null);
	const resizeStartXRef = useRef<number>(0);
	const resizeStartWidthRef = useRef<number>(0);

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
	if (!window.confirm(t('Button_DeletePopupConfirmation'))) {
			return;
		}

		try {
			setDeletingId(templateId);
			await apiClient.deleteApiMasterV1NotificationTemplates(templateId);
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
		let filtered = templates;
		
		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase().trim();
			filtered = templates.filter(tpl => {
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
					case 'name':
						aValue = (a.name || '').toLowerCase();
						bValue = (b.name || '').toLowerCase();
						break;
					case 'subject':
						aValue = (a.subjectTemplateText || '').toLowerCase();
						bValue = (b.subjectTemplateText || '').toLowerCase();
						break;
					case 'culture':
						aValue = (a.cultureFk || '').toLowerCase();
						bValue = (b.cultureFk || '').toLowerCase();
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
	}, [templates, searchTerm, sortColumn, sortDirection]);

	const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
	const paginatedTemplates = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredTemplates.slice(startIndex, endIndex);
	}, [filteredTemplates, currentPage, itemsPerPage]);

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
					<FaRedo /> {t('Button_Retry')}
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
										style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('name');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Name')}
											{getSortIcon('name')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'name')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.subject, minWidth: columnWidths.subject, maxWidth: columnWidths.subject }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('subject');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Subject')}
											{getSortIcon('subject')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'subject')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.culture, minWidth: columnWidths.culture, maxWidth: columnWidths.culture }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('culture');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Culture')}
											{getSortIcon('culture')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'culture')}
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
								{paginatedTemplates.length === 0 ? (
									<tr>
										<td colSpan={5} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedTemplates.map(tpl => (
										<tr key={tpl.id}>
											<td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{tpl.id}</td>
											<td className="name-cell" style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}>
												<div className="cell-content">
													{tpl.name || 'N/A'}
												</div>
											</td>
											<td style={{ width: columnWidths.subject, minWidth: columnWidths.subject, maxWidth: columnWidths.subject }}>{tpl.subjectTemplateText || 'N/A'}</td>
											<td style={{ width: columnWidths.culture, minWidth: columnWidths.culture, maxWidth: columnWidths.culture }}>{tpl.cultureFk || 'N/A'}</td>
											<td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
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




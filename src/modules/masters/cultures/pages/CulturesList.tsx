import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CultureDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
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
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
		id: 100,
		name: 200,
		country: 150,
		language: 150,
		enabled: 120,
		actions: 280
	});
	const [resizingColumn, setResizingColumn] = useState<string | null>(null);
	const resizeStartXRef = useRef<number>(0);
	const resizeStartWidthRef = useRef<number>(0);

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
		if (!window.confirm(t('Button_DeletePopupConfirmation'))) {
			return;
		}

		try {
			setDeletingId(cultureId);
			await apiClient.deleteApiMasterV1Cultures(cultureId);
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
		let filtered = cultures;
		
		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase().trim();
			filtered = cultures.filter(c => {
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
		}
		
		// Apply sorting
		if (sortColumn) {
			filtered = [...filtered].sort((a, b) => {
				let aValue: any;
				let bValue: any;
				
				switch (sortColumn) {
					case 'id':
						aValue = (a.id || '').toLowerCase();
						bValue = (b.id || '').toLowerCase();
						break;
					case 'name':
						aValue = ((a.nameTranslationKey || a.name || '')).toLowerCase();
						bValue = ((b.nameTranslationKey || b.name || '')).toLowerCase();
						break;
					case 'country':
						aValue = (a.countryFk || '').toLowerCase();
						bValue = (b.countryFk || '').toLowerCase();
						break;
					case 'language':
						aValue = (a.languageFk || '').toLowerCase();
						bValue = (b.languageFk || '').toLowerCase();
						break;
					case 'enabled':
						aValue = a.isEnabled ? 1 : 0;
						bValue = b.isEnabled ? 1 : 0;
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
	}, [cultures, searchTerm, sortColumn, sortDirection]);

	const totalPages = Math.ceil(filteredCultures.length / itemsPerPage);
	const paginatedCultures = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredCultures.slice(startIndex, endIndex);
	}, [filteredCultures, currentPage, itemsPerPage]);

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
					<FaRedo /> {t('Button_Retry')}
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
										style={{ width: columnWidths.country, minWidth: columnWidths.country, maxWidth: columnWidths.country }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('country');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Country')}
											{getSortIcon('country')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'country')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.language, minWidth: columnWidths.language, maxWidth: columnWidths.language }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('language');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Language')}
											{getSortIcon('language')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'language')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.enabled, minWidth: columnWidths.enabled, maxWidth: columnWidths.enabled }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('enabled');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Enabled')}
											{getSortIcon('enabled')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'enabled')}
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
								{paginatedCultures.length === 0 ? (
									<tr>
										<td colSpan={6} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedCultures.map(c => (
										<tr key={c.id}>
											<td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{c.id}</td>
											<td className="name-cell" style={{ width: columnWidths.name, minWidth: columnWidths.name, maxWidth: columnWidths.name }}>
												<div className="cell-content">
													{t(c.nameTranslationKey || c.name || 'N/A')}
												</div>
											</td>
											<td style={{ width: columnWidths.country, minWidth: columnWidths.country, maxWidth: columnWidths.country }}>{c.countryFk || 'N/A'}</td>
											<td style={{ width: columnWidths.language, minWidth: columnWidths.language, maxWidth: columnWidths.language }}>{c.languageFk || 'N/A'}</td>
											<td style={{ width: columnWidths.enabled, minWidth: columnWidths.enabled, maxWidth: columnWidths.enabled }}>
												<span className={`status-badge ${c.isEnabled ? 'active' : 'inactive'}`}>
													{c.isEnabled ? t('Label_Yes') : t('Label_No')}
												</span>
											</td>
											<td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
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




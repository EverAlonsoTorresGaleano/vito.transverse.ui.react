import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SequencesDTO } from '../../../../api/vito-transverse-identity-api';
import { apiClient } from '../../../../services/apiService';
import Pagination from '../../../../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import '../../../../styles/CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { translationService } from '../../../../services/translationService';

const SequencesList: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [sequences, setSequences] = useState<SequencesDTO[]>([]);
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
		company: 150,
		application: 150,
		sequenceType: 150,
		sequenceNameFormat: 200,
		sequenceIndex: 120,
		textFormat: 150,
		actions: 280
	});
	const [resizingColumn, setResizingColumn] = useState<string | null>(null);
	const resizeStartXRef = useRef<number>(0);
	const resizeStartWidthRef = useRef<number>(0);

	const fetchSequences = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiClient.getApiMasterV1SequencesAll();
			setSequences(data || []);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load sequences';
			setError(errorMessage);
			console.error('Error fetching sequences:', err);
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
				fetchSequences();
			}
		};

		initializeCulture();
	}, [fetchSequences]);

	const handleDelete = async (sequenceId: number) => {
		if (!window.confirm(t('Button_DeletePopupConfirmation'))) {
			return;
		}

		try {
			setDeletingId(sequenceId);
			await apiClient.deleteApiMasterV1Sequences(sequenceId);
			await fetchSequences();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete sequence';
			alert(errorMessage);
			console.error('Error deleting sequence:', err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleView = (sequenceId: number) => {
		navigate(`/sequence/view/${sequenceId}`);
	};

	const handleEdit = (sequenceId: number) => {
		navigate(`/sequence/edit/${sequenceId}`);
	};

	const filteredSequences = useMemo(() => {
		let filtered = sequences;
		
		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase().trim();
			filtered = sequences.filter(s => {
				const id = s.id?.toString() || '';
				const company = s.companyNameTranslationKey?.toLowerCase() || '';
				const application = s.applicationNameTranslationKey?.toLowerCase() || '';
				const sequenceType = s.sequenceTypeNameTranslationKey?.toLowerCase() || '';
				const nameFormat = s.sequenceNameFormat?.toLowerCase() || '';
				const textFormat = s.textFormat?.toLowerCase() || '';
				const indexStr = s.sequenceIndex?.toString() || '';
				return (
					id.includes(searchLower) ||
					company.includes(searchLower) ||
					application.includes(searchLower) ||
					sequenceType.includes(searchLower) ||
					nameFormat.includes(searchLower) ||
					textFormat.includes(searchLower) ||
					indexStr.includes(searchLower)
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
					case 'application':
						aValue = (a.applicationNameTranslationKey || '').toLowerCase();
						bValue = (b.applicationNameTranslationKey || '').toLowerCase();
						break;
					case 'sequenceType':
						aValue = (a.sequenceTypeNameTranslationKey || '').toLowerCase();
						bValue = (b.sequenceTypeNameTranslationKey || '').toLowerCase();
						break;
					case 'sequenceNameFormat':
						aValue = (a.sequenceNameFormat || '').toLowerCase();
						bValue = (b.sequenceNameFormat || '').toLowerCase();
						break;
					case 'sequenceIndex':
						aValue = a.sequenceIndex ?? 0;
						bValue = b.sequenceIndex ?? 0;
						break;
					case 'textFormat':
						aValue = (a.textFormat || '').toLowerCase();
						bValue = (b.textFormat || '').toLowerCase();
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
	}, [sequences, searchTerm, sortColumn, sortDirection]);

	const totalPages = Math.ceil(filteredSequences.length / itemsPerPage);
	const paginatedSequences = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredSequences.slice(startIndex, endIndex);
	}, [filteredSequences, currentPage, itemsPerPage]);

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
					<h1>{t('SequencesListPage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="list-page" data-current-culture={currentCulture || undefined}>
				<div className="page-header">
					<h1>{t('SequencesListPage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button
					className="refresh-button"
					onClick={() => fetchSequences()}
					style={{ marginTop: '20px' }}
				>
					<FaRedo style={{ marginRight: '8px' }} />
					{t('Button_Retry')}
				</button>
			</div>
		);
	}

	return (
		<div className="list-page" data-current-culture={currentCulture || undefined}>
			<div className="page-header">
				<h1>{t('SequencesListPage_Title')}</h1>
				<p className="page-subtitle">{t('SequencesListPage_Subtitle')}</p>
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
								onClick={() => navigate('/sequence/create')}
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
										style={{ width: columnWidths.application, minWidth: columnWidths.application, maxWidth: columnWidths.application }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('application');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_Application')}
											{getSortIcon('application')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'application')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.sequenceType, minWidth: columnWidths.sequenceType, maxWidth: columnWidths.sequenceType }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('sequenceType');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_SequenceType')}
											{getSortIcon('sequenceType')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'sequenceType')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.sequenceNameFormat, minWidth: columnWidths.sequenceNameFormat, maxWidth: columnWidths.sequenceNameFormat }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('sequenceNameFormat');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_SequenceNameFormat')}
											{getSortIcon('sequenceNameFormat')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'sequenceNameFormat')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.sequenceIndex, minWidth: columnWidths.sequenceIndex, maxWidth: columnWidths.sequenceIndex }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('sequenceIndex');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_SequenceIndex')}
											{getSortIcon('sequenceIndex')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'sequenceIndex')}
										/>
									</th>
									<th 
										className="sortable resizable" 
										style={{ width: columnWidths.textFormat, minWidth: columnWidths.textFormat, maxWidth: columnWidths.textFormat }}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (!target.classList.contains('resize-handle')) {
												handleSort('textFormat');
											}
										}}
									>
										<div className="sortable-header">
											{t('Label_TextFormat')}
											{getSortIcon('textFormat')}
										</div>
										<div 
											className="resize-handle"
											onMouseDown={(e) => handleResizeStart(e, 'textFormat')}
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
								{paginatedSequences.length === 0 ? (
									<tr>
										<td colSpan={8} className="empty-state">
											{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
										</td>
									</tr>
								) : (
									paginatedSequences.map(sequence => (
										<tr key={sequence.id}>
											<td style={{ width: columnWidths.id, minWidth: columnWidths.id, maxWidth: columnWidths.id }}>{sequence.id}</td>
											<td style={{ width: columnWidths.company, minWidth: columnWidths.company, maxWidth: columnWidths.company }}>{sequence.companyNameTranslationKey || '-'}</td>
											<td style={{ width: columnWidths.application, minWidth: columnWidths.application, maxWidth: columnWidths.application }}>{sequence.applicationNameTranslationKey || '-'}</td>
											<td style={{ width: columnWidths.sequenceType, minWidth: columnWidths.sequenceType, maxWidth: columnWidths.sequenceType }}>{t(sequence.sequenceTypeNameTranslationKey || '-')}</td>
											<td style={{ width: columnWidths.sequenceNameFormat, minWidth: columnWidths.sequenceNameFormat, maxWidth: columnWidths.sequenceNameFormat }}>{sequence.sequenceNameFormat || '-'}</td>
											<td style={{ width: columnWidths.sequenceIndex, minWidth: columnWidths.sequenceIndex, maxWidth: columnWidths.sequenceIndex }}>{sequence.sequenceIndex ?? '-'}</td>
											<td style={{ width: columnWidths.textFormat, minWidth: columnWidths.textFormat, maxWidth: columnWidths.textFormat }}>{sequence.textFormat || '-'}</td>
											<td className="actions-cell" style={{ width: columnWidths.actions, minWidth: columnWidths.actions, maxWidth: columnWidths.actions }}>
												<div className="action-buttons">
													<button
														className="action-button view-button"
														title={t('Button_View_Tooltip')}
														onClick={() => sequence.id && handleView(sequence.id)}
													>
														<FaEye /> {t('Button_View')}
													</button>
													<button
														className="action-button secondary-button"
														title={t('Button_Edit_Tooltip')}
														onClick={() => sequence.id && handleEdit(sequence.id)}
													>
														<FaEdit /> {t('Button_Edit')}
													</button>
													<button
														className="action-button delete-button"
														title={t('Button_Delete_Tooltip')}
														onClick={() => sequence.id && handleDelete(sequence.id)}
														disabled={deletingId === sequence.id}
													>
														<FaTrash /> {deletingId === sequence.id ? t('Button_Deleting') : t('Button_Delete')}
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{filteredSequences.length > 0 && (
						<Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredSequences.length}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="sequences"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default SequencesList;



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SequencesDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './CompaniesList.css';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { translationService } from '../services/translationService';

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
		if (!window.confirm(t('SequencesListPage_DeleteConfirmation'))) {
			return;
		}

		try {
			setDeletingId(sequenceId);
			await apiClient.deleteApiMasterV1SequencesDelete(sequenceId);
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
		if (!searchTerm.trim()) {
			return sequences;
		}
		const searchLower = searchTerm.toLowerCase().trim();
		return sequences.filter(s => {
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
	}, [sequences, searchTerm]);

	const totalPages = Math.ceil(filteredSequences.length / itemsPerPage);
	const paginatedSequences = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredSequences.slice(startIndex, endIndex);
	}, [filteredSequences, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [itemsPerPage, searchTerm]);

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
								<div className="search-icon">
									<FaSearch />
								</div>
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
						
								<button  className="new-company-button"
								onClick={() => navigate('/sequence/create')}>
									<FaPlus  />
									{t('Button_New')}
								</button>
						
						</div>
					</div>

					<div className="table-container">
						<table className="data-table">
							<thead>
								<tr>
									<th style={{ width: '80px' }}>{t('Label_Id')}</th>
									<th>{t('Label_Company')}</th>
									<th>{t('Label_Application')}</th>
									<th>{t('Label_SequenceType')}</th>
									<th>{t('Label_SequenceNameFormat')}</th>
									<th>{t('Label_SequenceIndex')}</th>
									<th>{t('Label_TextFormat')}</th>
									<th style={{ width: '160px' }}>{t('Label_Actions')}</th>
								</tr>
							</thead>
							<tbody>
								{paginatedSequences.length === 0 ? (
									<tr>
										<td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>
										{searchTerm ? t('GridView_NoResultsFound') : t('GridView_NoDataFound')}
    
										</td>
									</tr>
								) : (
									paginatedSequences.map(sequence => (
										<tr key={sequence.id}>
											<td>{sequence.id}</td>
											<td>{sequence.companyNameTranslationKey || '-'}</td>
											<td>{sequence.applicationNameTranslationKey || '-'}</td>
											<td>{sequence.sequenceTypeNameTranslationKey || '-'}</td>
											<td>{sequence.sequenceNameFormat || '-'}</td>
											<td>{sequence.sequenceIndex ?? '-'}</td>
											<td>{sequence.textFormat || '-'}</td>
											<td>
												<div className="action-buttons">
													<button
														className="action-button view-button"
														title={t('Button_View_Tooltip')}

														onClick={() => sequence.id && handleView(sequence.id)}
													>
														<FaEye /> {t('Button_View')}
													</button>
													<button
														className="action-button edit-button"
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
														<FaTrash /> {t('Button_Delete')}
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



import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { SequencesDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewSequence: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [sequence, setSequence] = useState<SequencesDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSequence = async () => {
			if (!id) {
				setError(t('Label_SequenceIdRequired'));
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const data = await apiClient.getApiMasterV1Sequences(parseInt(id, 10));
				setSequence(data);
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchSequence();
	}, [id, t]);

	const handleEdit = () => {
		if (sequence?.id != null) {
			navigate(`/sequence/edit/${sequence.id}`);
		}
	};

	const handleBack = () => {
		navigate('/sequences');
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewSequencePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewSequencePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
					← {t('Button_Back')}
				</button>
			</div>
		);
	}

	if (!sequence) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewSequencePage_Title')}</h1>
				</div>
				<div className="error">{t('Label_NotFound')}</div>
				<button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
					← {t('Button_Back')}
				</button>
			</div>
		);
	}

	return (
		<div className="user-profile-page">
			<div className="profile-header">
				<div className="header-actions">
					<button className="back-button" onClick={handleBack}>
						← {t('Button_Back')}
					</button>
					<h1>{t('ViewSequencePage_Title')}</h1>
					<button className="edit-button" onClick={handleEdit}>
						{t('Button_Edit')}
					</button>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{(sequence.sequenceNameFormat || sequence.textFormat || 'S').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{sequence.sequenceNameFormat || sequence.textFormat || `#${sequence.id}`}
					</h2>
				</div>

				<div className="profile-details">
					<div className="detail-section">
						<h3 className="section-title">{t('ViewSequencePage_BasicInfo')}</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>{t('Label_Id')}</label>
								<div className="detail-value">{sequence.id ?? 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Company')}</label>
								<div className="detail-value">{sequence.companyNameTranslationKey || sequence.companyId || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Application')}</label>
								<div className="detail-value">{sequence.applicationNameTranslationKey || sequence.applicationId || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_SequenceType')}</label>
								<div className="detail-value">{sequence.sequenceTypeNameTranslationKey || sequence.sequenceTypeId || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_SequenceNameFormat')}</label>
								<div className="detail-value">{sequence.sequenceNameFormat || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_SequenceIndex')}</label>
								<div className="detail-value">{sequence.sequenceIndex ?? 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_TextFormat')}</label>
								<div className="detail-value">{sequence.textFormat || 'N/A'}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewSequence;



import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { SequencesDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditSequence: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [sequence, setSequence] = useState<SequencesDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		companyId: '',
		applicationId: '',
		sequenceTypeId: '',
		sequenceNameFormat: '',
		sequenceIndex: '',
		textFormat: ''
	});

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
				setFormData({
					companyId: (data.companyId ?? '').toString(),
					applicationId: (data.applicationId ?? '').toString(),
					sequenceTypeId: (data.sequenceTypeId ?? '').toString(),
					sequenceNameFormat: data.sequenceNameFormat || '',
					sequenceIndex: (data.sequenceIndex ?? '').toString(),
					textFormat: data.textFormat || ''
				});
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchSequence();
	}, [id, t]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!sequence) return;

		try {
			setSaving(true);
			setError(null);
			const dto: SequencesDTO = {
				id: sequence.id,
				companyId: formData.companyId ? parseInt(formData.companyId, 10) : undefined,
				applicationId: formData.applicationId ? parseInt(formData.applicationId, 10) : undefined,
				sequenceTypeId: formData.sequenceTypeId ? parseInt(formData.sequenceTypeId, 10) : undefined,
				sequenceNameFormat: formData.sequenceNameFormat || undefined,
				sequenceIndex: formData.sequenceIndex ? parseInt(formData.sequenceIndex, 10) : undefined,
				textFormat: formData.textFormat || undefined
			};
			const updated = await apiClient.putApiMasterV1Sequences(dto);
			navigate(`/sequence/view/${updated.id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (sequence?.id != null) {
			navigate(`/sequence/view/${sequence.id}`);
		} else {
			navigate('/sequences');
		}
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditSequencePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error && !sequence) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditSequencePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={() => navigate('/sequences')} style={{ marginTop: '20px' }}>
					← {t('Button_Back')}
				</button>
			</div>
		);
	}

	return (
		<div className="user-profile-page">
			<div className="profile-header">
				<div className="header-actions">
					<button className="back-button" onClick={handleCancel}>
						← {t('Button_Cancel')}
					</button>
					<h1>{t('EditSequencePage_Title')}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{(formData.sequenceNameFormat || formData.textFormat || 'S').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{formData.sequenceNameFormat || formData.textFormat || t('Label_Unnamed')}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('EditSequencePage_BasicInfo')}</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="companyId">
									{t('Label_CompanyId')}
								</label>
								<input
									type="number"
									id="companyId"
									name="companyId"
									value={formData.companyId}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="applicationId">
									{t('Label_ApplicationId')}
								</label>
								<input
									type="number"
									id="applicationId"
									name="applicationId"
									value={formData.applicationId}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="sequenceTypeId">
									{t('Label_SequenceTypeId')}
								</label>
								<input
									type="number"
									id="sequenceTypeId"
									name="sequenceTypeId"
									value={formData.sequenceTypeId}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="sequenceNameFormat">
									{t('Label_SequenceNameFormat')}
								</label>
								<input
									type="text"
									id="sequenceNameFormat"
									name="sequenceNameFormat"
									value={formData.sequenceNameFormat}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="sequenceIndex">
									{t('Label_SequenceIndex')}
								</label>
								<input
									type="number"
									id="sequenceIndex"
									name="sequenceIndex"
									value={formData.sequenceIndex}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="textFormat">
									{t('Label_TextFormat')}
								</label>
								<input
									type="text"
									id="textFormat"
									name="textFormat"
									value={formData.textFormat}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
						</div>
					</div>

					<div className="form-actions">
						<button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>
							{t('Button_Cancel')}
						</button>
						<button type="submit" className="save-button" disabled={saving}>
							{saving ? t('Button_SaveUpdating') : t('Button_SaveUpdate')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditSequence;



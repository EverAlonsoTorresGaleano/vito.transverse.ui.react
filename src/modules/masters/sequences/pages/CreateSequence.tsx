import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { SequencesDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const CreateSequence: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError(null);

			const dto: SequencesDTO = {
				companyId: formData.companyId ? parseInt(formData.companyId, 10) : undefined,
				applicationId: formData.applicationId ? parseInt(formData.applicationId, 10) : undefined,
				sequenceTypeId: formData.sequenceTypeId ? parseInt(formData.sequenceTypeId, 10) : undefined,
				sequenceNameFormat: formData.sequenceNameFormat || undefined,
				sequenceIndex: formData.sequenceIndex ? parseInt(formData.sequenceIndex, 10) : undefined,
				textFormat: formData.textFormat || undefined
			};

			const created = await apiClient.postApiMasterV1Sequences(dto);
			navigate(`/sequence/view/${created.id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		navigate('/sequences');
	};

	return (
		<div className="user-profile-page">
			<div className="profile-header">
				<div className="header-actions">
					<button className="back-button" onClick={handleCancel}>
						← {t('Button_Cancel')}
					</button>
					<h1>{t('NewSequencePage_Title')}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{(formData.sequenceNameFormat || formData.textFormat || 'S').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{formData.sequenceNameFormat || formData.textFormat || t('NewSequencePage_NewSequence')}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('NewSequencePage_BasicInfo')}</h3>
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
							{saving ? t('Button_Saving') : t('Button_Save')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateSequence;



import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { NotificationTemplateDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const CreateNotificationTemplate: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		notificationTemplateGroupId: '',
		cultureFk: '',
		name: '',
		subjectTemplateText: '',
		messageTemplateText: '',
		isHtml: true
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value, type, checked } = e.target as HTMLInputElement;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formData.name || !formData.subjectTemplateText) {
			setError(t('Label_RequiredFieldsMissing'));
			return;
		}

		try {
			setSaving(true);
			setError(null);

			const dto: NotificationTemplateDTO = {
				notificationTemplateGroupId: formData.notificationTemplateGroupId ? Number(formData.notificationTemplateGroupId) : undefined,
				cultureFk: formData.cultureFk || undefined,
				name: formData.name || undefined,
				subjectTemplateText: formData.subjectTemplateText || undefined,
				messageTemplateText: formData.messageTemplateText || undefined,
				isHtml: formData.isHtml
			};

			const created = await apiClient.postApiMasterV1NotificationTemplates(dto);
			navigate(`/notification-template/view/${created.id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		navigate('/notification-templates');
	};

	return (
		<div className="user-profile-page">
			<div className="profile-header">
				<div className="header-actions">
					<button className="back-button" onClick={handleCancel}>
						← {t('Button_Cancel')}
					</button>
					<h1>{t('NewNotificationTemplatePage_Title')}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{formData.name
							? formData.name.charAt(0).toUpperCase()
							: 'N'}
					</div>
					<h2 className="profile-name">
						{formData.name || t('NewNotificationTemplatePage_NewTemplate')}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('NewNotificationTemplatePage_BasicInfo')}</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="notificationTemplateGroupId">
									{t('Label_GroupId')}
								</label>
								<input
									type="number"
									id="notificationTemplateGroupId"
									name="notificationTemplateGroupId"
									value={formData.notificationTemplateGroupId}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="cultureFk">
									{t('Label_Culture')}
								</label>
								<input
									type="text"
									id="cultureFk"
									name="cultureFk"
									value={formData.cultureFk}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="name">
									{t('Label_Name')} *
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="form-input"
									required
								/>
							</div>
						</div>
					</div>

					<div className="form-section">
						<h3 className="section-title">{t('NewNotificationTemplatePage_Content')}</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="subjectTemplateText">
									{t('Label_Subject')} *
								</label>
								<input
									type="text"
									id="subjectTemplateText"
									name="subjectTemplateText"
									value={formData.subjectTemplateText}
									onChange={handleChange}
									className="form-input"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="messageTemplateText">
									{t('Label_Message')}
								</label>
								<textarea
									id="messageTemplateText"
									name="messageTemplateText"
									value={formData.messageTemplateText}
									onChange={handleChange}
									className="form-input"
									rows={6}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="isHtml">
									{t('Label_IsHtml')}
								</label>
								<input
									type="checkbox"
									id="isHtml"
									name="isHtml"
									checked={formData.isHtml}
									onChange={handleChange}
									className="form-checkbox"
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

export default CreateNotificationTemplate;




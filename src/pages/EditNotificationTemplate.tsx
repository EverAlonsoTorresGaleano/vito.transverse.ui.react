import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { NotificationTemplateDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const EditNotificationTemplate: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [template, setTemplate] = useState<NotificationTemplateDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
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

	useEffect(() => {
		const fetchTemplate = async () => {
			if (!id) {
				setError(t('Label_TemplateIdRequired'));
				setLoading(false);
				return;
			}
			try {
				setLoading(true);
				const data = await apiClient.getApiMasterV1NotificationTemplates(Number(id));
				setTemplate(data);
				setFormData({
					notificationTemplateGroupId: (data.notificationTemplateGroupId ?? '').toString(),
					cultureFk: data.cultureFk || '',
					name: data.name || '',
					subjectTemplateText: data.subjectTemplateText || '',
					messageTemplateText: data.messageTemplateText || '',
					isHtml: data.isHtml ?? true
				});
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchTemplate();
	}, [id, t]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value, type, checked } = e.target as HTMLInputElement;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!template) return;
		if (!formData.name || !formData.subjectTemplateText) {
			setError(t('Label_RequiredFieldsMissing'));
			return;
		}

		try {
			setSaving(true);
			setError(null);
			const dto: NotificationTemplateDTO = {
				id: template.id,
				notificationTemplateGroupId: formData.notificationTemplateGroupId ? Number(formData.notificationTemplateGroupId) : undefined,
				cultureFk: formData.cultureFk || undefined,
				name: formData.name || undefined,
				subjectTemplateText: formData.subjectTemplateText || undefined,
				messageTemplateText: formData.messageTemplateText || undefined,
				isHtml: formData.isHtml
			};
			await apiClient.putApiMasterV1NotificationTemplates(dto);
			navigate(`/notification-template/view/${dto.id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (template?.id !== undefined) {
			navigate(`/notification-template/view/${template.id}`);
		} else {
			navigate('/notification-templates');
		}
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditNotificationTemplatePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error && !template) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditNotificationTemplatePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={() => navigate('/notification-templates')} style={{ marginTop: '20px' }}>
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
					<h1>{t('EditNotificationTemplatePage_Title')}</h1>
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
						{formData.name || t('Label_Unnamed')}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('EditNotificationTemplatePage_BasicInfo')}</h3>
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
						<h3 className="section-title">{t('EditNotificationTemplatePage_Content')}</h3>
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
							{saving ? t('Button_SaveUpdating') : t('Button_SaveUpdate')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditNotificationTemplate;




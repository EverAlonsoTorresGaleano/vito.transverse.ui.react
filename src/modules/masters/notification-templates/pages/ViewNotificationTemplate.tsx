import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { NotificationTemplateDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewNotificationTemplate: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [template, setTemplate] = useState<NotificationTemplateDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

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
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchTemplate();
	}, [id, t]);

	const handleEdit = () => {
		if (template?.id !== undefined) {
			navigate(`/notification-template/edit/${template.id}`);
		}
	};

	const handleBack = () => {
		navigate('/notification-templates');
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewNotificationTemplatePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewNotificationTemplatePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
					← {t('Button_Back')}
				</button>
			</div>
		);
	}

	if (!template) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewNotificationTemplatePage_Title')}</h1>
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
					<h1>{t('ViewNotificationTemplatePage_Title')}</h1>
					<button className="edit-button" onClick={handleEdit}>
						{t('Button_Edit')}
					</button>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{template.name
							? template.name.charAt(0).toUpperCase()
							: 'N'}
					</div>
					<h2 className="profile-name">
						{template.name || t('Label_NoName')}
					</h2>
				</div>

				<div className="profile-details">
					<div className="detail-section">
						<h3 className="section-title">{t('ViewNotificationTemplatePage_BasicInfo')}</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>{t('Label_Id')}</label>
								<div className="detail-value">{template.id ?? 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_GroupId')}</label>
								<div className="detail-value">{template.notificationTemplateGroupId ?? 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Culture')}</label>
								<div className="detail-value">{template.cultureFk || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_IsHtml')}</label>
								<div className="detail-value">{template.isHtml ? t('Label_Yes') : t('Label_No')}</div>
							</div>
						</div>
					</div>

					<div className="detail-section">
						<h3 className="section-title">{t('ViewNotificationTemplatePage_Content')}</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>{t('Label_Subject')}</label>
								<div className="detail-value">{template.subjectTemplateText || 'N/A'}</div>
							</div>
							<div className="detail-item" style={{ gridColumn: '1 / -1' }}>
								<label>{t('Label_Message')}</label>
								<div className="detail-value">
									{template.messageTemplateText || 'N/A'}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewNotificationTemplate;





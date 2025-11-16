import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { LanguageDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewLanguage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [language, setLanguage] = useState<LanguageDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLanguage = async () => {
			if (!id) {
				setError(t('Label_LanguageIdRequired'));
				setLoading(false);
			 return;
			}

			try {
				setLoading(true);
				const data = await apiClient.getApiMasterV1Languages(id);
				setLanguage(data);
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchLanguage();
	}, [id, t]);

	const handleEdit = () => {
		if (language?.id) {
			navigate(`/language/edit/${language.id}`);
		}
	};

	const handleBack = () => {
		navigate('/languages');
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewLanguagePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
	 return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewLanguagePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
					← {t('Button_Back')}
				</button>
			</div>
		);
	}

	if (!language) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewLanguagePage_Title')}</h1>
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
					<h1>{t('ViewLanguagePage_Title')}</h1>
					<button className="edit-button" onClick={handleEdit}>
						{t('Button_Edit')}
					</button>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{language.nameTranslationKey ? language.nameTranslationKey.charAt(0).toUpperCase() : (language.id || 'L').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{language.nameTranslationKey || language.id || t('Label_NoName')}
					</h2>
				</div>

				<div className="profile-details">
					<div className="detail-section">
						<h3 className="section-title">{t('ViewLanguagePage_BasicInfo')}</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>{t('Label_Id')}</label>
								<div className="detail-value">{language.id || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Name')}</label>
								<div className="detail-value">{language.nameTranslationKey || 'N/A'}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewLanguage;



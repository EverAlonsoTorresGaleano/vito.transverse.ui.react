import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { CultureDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewCulture: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [culture, setCulture] = useState<CultureDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCulture = async () => {
			if (!id) {
				setError(t('Label_CultureIdRequired'));
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const data = await apiClient.getApiMasterV1Cultures(id);
				setCulture(data);
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchCulture();
	}, [id, t]);

	const handleEdit = () => {
		if (culture?.id) {
			navigate(`/culture/edit/${culture.id}`);
		}
	};

	const handleBack = () => {
		navigate('/cultures');
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewCulturePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewCulturePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
					← {t('Button_Back')}
				</button>
			</div>
		);
	}

	if (!culture) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('ViewCulturePage_Title')}</h1>
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
					<h1>{t('ViewCulturePage_Title')}</h1>
					<button className="edit-button" onClick={handleEdit}>
						{t('Button_Edit')}
					</button>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{culture.nameTranslationKey
							? culture.nameTranslationKey.charAt(0).toUpperCase()
							: (culture.id || 'C').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{culture.nameTranslationKey || culture.name || culture.id || t('Label_NoName')}
					</h2>
				</div>

				<div className="profile-details">
					<div className="detail-section">
						<h3 className="section-title">{t('ViewCulturePage_BasicInfo')}</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>{t('Label_Id')}</label>
								<div className="detail-value">{culture.id || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Name')}</label>
								<div className="detail-value">{culture.nameTranslationKey || culture.name || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Country')}</label>
								<div className="detail-value">{culture.countryFk || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Language')}</label>
								<div className="detail-value">{culture.languageFk || 'N/A'}</div>
							</div>
							<div className="detail-item">
								<label>{t('Label_Enabled')}</label>
								<div className="detail-value">{culture.isEnabled ? t('Label_Yes') : t('Label_No')}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewCulture;




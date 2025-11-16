import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { LanguageDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const EditLanguage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [language, setLanguage] = useState<LanguageDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		id: '',
		nameTranslationKey: ''
	});

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
				setFormData({
					id: data.id || '',
					nameTranslationKey: data.nameTranslationKey || ''
				});
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
			 setError(errorMessage);
				setLoading(false);
			}
		};
		fetchLanguage();
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
		if (!language) return;
		if (!formData.id || !formData.nameTranslationKey) {
			setError(t('Label_RequiredFieldsMissing'));
			return;
		}

		try {
			setSaving(true);
			setError(null);
			const dto: LanguageDTO = {
				id: formData.id,
				nameTranslationKey: formData.nameTranslationKey
			};
			await apiClient.putApiMasterV1Languages(dto);
			navigate(`/language/view/${dto.id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (language?.id) {
			navigate(`/language/view/${language.id}`);
		} else {
			navigate('/languages');
		}
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditLanguagePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error && !language) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditLanguagePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={() => navigate('/languages')} style={{ marginTop: '20px' }}>
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
					<h1>{t('EditLanguagePage_Title')}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{formData.nameTranslationKey
							? formData.nameTranslationKey.charAt(0).toUpperCase()
							: (formData.id || 'L').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{formData.nameTranslationKey || formData.id || t('Label_Unnamed')}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('EditLanguagePage_BasicInfo')}</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="id">
									{t('Label_Id')} *
								</label>
								<input
									type="text"
									id="id"
									name="id"
									value={formData.id}
									onChange={handleChange}
									className="form-input"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="nameTranslationKey">
									{t('Label_Name')} *
								</label>
								<input
									type="text"
									id="nameTranslationKey"
									name="nameTranslationKey"
									value={formData.nameTranslationKey}
									onChange={handleChange}
									className="form-input"
									required
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

export default EditLanguage;



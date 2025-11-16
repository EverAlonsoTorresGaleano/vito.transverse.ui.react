import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { CultureDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditCulture: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation();
	const [culture, setCulture] = useState<CultureDTO | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		id: '',
		nameTranslationKey: '',
		countryFk: '',
		languageFk: '',
		isEnabled: true,
		name: ''
	});

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
				setFormData({
					id: data.id || '',
					nameTranslationKey: data.nameTranslationKey || '',
					countryFk: data.countryFk || '',
					languageFk: data.languageFk || '',
					isEnabled: data.isEnabled ?? true,
					name: data.name || ''
				});
				setLoading(false);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
				setError(errorMessage);
				setLoading(false);
			}
		};
		fetchCulture();
	}, [id, t]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type, checked } = e.target as HTMLInputElement;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!culture) return;
		if (!formData.id || !formData.nameTranslationKey) {
			setError(t('Label_RequiredFieldsMissing'));
			return;
		}

		try {
			setSaving(true);
			setError(null);
			const dto: CultureDTO = {
				id: formData.id,
				nameTranslationKey: formData.nameTranslationKey,
				countryFk: formData.countryFk || undefined,
				languageFk: formData.languageFk || undefined,
				isEnabled: formData.isEnabled,
				name: formData.name || undefined
			};
			await apiClient.putApiMasterV1Cultures(dto);
			navigate(`/culture/view/${dto.id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (culture?.id) {
			navigate(`/culture/view/${culture.id}`);
		} else {
			navigate('/cultures');
		}
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditCulturePage_Title')}</h1>
				</div>
				<div className="loading">{t('Page_LoadingData')}</div>
			</div>
		);
	}

	if (error && !culture) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<h1>{t('EditCulturePage_Title')}</h1>
				</div>
				<div className="error">{error}</div>
				<button className="back-button" onClick={() => navigate('/cultures')} style={{ marginTop: '20px' }}>
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
					<h1>{t('EditCulturePage_Title')}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{formData.nameTranslationKey
							? formData.nameTranslationKey.charAt(0).toUpperCase()
							: (formData.id || 'C').charAt(0).toUpperCase()}
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
						<h3 className="section-title">{t('EditCulturePage_BasicInfo')}</h3>
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
							<div className="form-group">
								<label htmlFor="name">
									{t('Label_DisplayName')}
								</label>
								<input
									type="text"
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
						</div>
					</div>

					<div className="form-section">
						<h3 className="section-title">{t('EditCulturePage_AdditionalInfo')}</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="countryFk">
									{t('Label_Country')}
								</label>
								<input
									type="text"
									id="countryFk"
									name="countryFk"
									value={formData.countryFk}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="languageFk">
									{t('Label_Language')}
								</label>
								<input
									type="text"
									id="languageFk"
									name="languageFk"
									value={formData.languageFk}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="isEnabled">
									{t('Label_Enabled')}
								</label>
								<input
									type="checkbox"
									id="isEnabled"
									name="isEnabled"
									checked={formData.isEnabled}
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

export default EditCulture;




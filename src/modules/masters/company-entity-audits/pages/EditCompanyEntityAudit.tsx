import React, { useEffect, useState, FormEvent, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { CompanyEntityAuditDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditCompanyEntityAudit: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		companyFk: '',
		entityFk: '',
		auditTypeFk: '',
		isActive: true
	});

	const fetchAudit = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const dto = await apiClient.getApiAuditoriesV1CompanyEntityAudits(parseInt(id!, 10));
			setFormData({
				companyFk: dto.companyFk?.toString() || '',
				entityFk: dto.entityFk?.toString() || '',
				auditTypeFk: dto.auditTypeFk?.toString() || '',
				isActive: !!dto.isActive
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [id, t]);

	useEffect(() => {
		if (id) {
			fetchAudit();
		}
	}, [id, fetchAudit]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError(null);

			const dto: CompanyEntityAuditDTO = {
				id: id ? parseInt(id, 10) : undefined,
				companyFk: formData.companyFk ? parseInt(formData.companyFk, 10) : undefined,
				entityFk: formData.entityFk ? parseInt(formData.entityFk, 10) : undefined,
				auditTypeFk: formData.auditTypeFk ? parseInt(formData.auditTypeFk, 10) : undefined,
				isActive: formData.isActive
			};

			await apiClient.putApiAuditoriesV1CompanyEntityAudits(dto);
			navigate(`/company-entity-audit/view/${id}`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : t('Label_SaveError');
			setError(errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		navigate(`/company-entity-audit/view/${id}`);
	};

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<div className="header-actions">
						<div style={{ width: '80px' }}></div>
						<h1>{t('EditCompanyEntityAuditPage_Title') || 'Edit Company Entity Audit'}</h1>
						<div style={{ width: '80px' }}></div>
					</div>
				</div>
				<div className="profile-card">
					<div className="loading">{t('Page_LoadingData')}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="user-profile-page">
			<div className="profile-header">
				<div className="header-actions">
					<button className="back-button" onClick={handleCancel}>
						← {t('Button_Back')}
					</button>
					<h1>{t('EditCompanyEntityAuditPage_Title') || 'Edit Company Entity Audit'}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('EditCompanyEntityAuditPage_BasicInfo') || 'Basic info'}</h3>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="companyFk">
									{t('Label_CompanyId')}
								</label>
								<input
									type="number"
									id="companyFk"
									name="companyFk"
									value={formData.companyFk}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="entityFk">
									{t('Label_EntityId')}
								</label>
								<input
									type="number"
									id="entityFk"
									name="entityFk"
									value={formData.entityFk}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="auditTypeFk">
									{t('Label_AuditTypeId')}
								</label>
								<input
									type="number"
									id="auditTypeFk"
									name="auditTypeFk"
									value={formData.auditTypeFk}
									onChange={handleChange}
									className="form-input"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="isActive">
									{t('Label_Status')}
								</label>
								<div className="checkbox-row">
									<input
										type="checkbox"
										id="isActive"
										name="isActive"
										checked={formData.isActive}
										onChange={handleChange}
									/>
									<span>{formData.isActive ? t('Label_Active') : t('Label_Inactive')}</span>
								</div>
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

export default EditCompanyEntityAudit;



import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { CompanyEntityAuditDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const CreateCompanyEntityAudit: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		companyFk: '',
		entityFk: '',
		auditTypeFk: '',
		isActive: true
	});

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
				companyFk: formData.companyFk ? parseInt(formData.companyFk, 10) : undefined,
				entityFk: formData.entityFk ? parseInt(formData.entityFk, 10) : undefined,
				auditTypeFk: formData.auditTypeFk ? parseInt(formData.auditTypeFk, 10) : undefined,
				isActive: formData.isActive
			};

		 const created = await apiClient.postApiAuditoriesV1CompanyEntityAudits(dto);
		 navigate(`/company-entity-audit/view/${created.id}`);
		} catch (err) {
		 const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
		 setError(errorMessage);
		} finally {
		 setSaving(false);
		}
	};

	const handleCancel = () => {
		navigate('/company-entity-audits');
	};

	return (
		<div className="user-profile-page">
			<div className="profile-header">
				<div className="header-actions">
					<button className="back-button" onClick={handleCancel}>
						← {t('Button_Cancel')}
					</button>
					<h1>{t('NewCompanyEntityAuditPage_Title') || 'New Company Entity Audit'}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{(formData.auditTypeFk?.toString() || 'A').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{t('NewCompanyEntityAuditPage_New') || 'New Audit'}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="profile-form">
					{error && (
						<div className="form-error">
							{error}
						</div>
					)}

					<div className="form-section">
						<h3 className="section-title">{t('NewCompanyEntityAuditPage_BasicInfo') || 'Basic info'}</h3>
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

export default CreateCompanyEntityAudit;



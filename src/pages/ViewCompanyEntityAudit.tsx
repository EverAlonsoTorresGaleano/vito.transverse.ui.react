import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { CompanyEntityAuditDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const ViewCompanyEntityAudit: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { t } = useTranslation();
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [audit, setAudit] = useState<CompanyEntityAuditDTO | null>(null);

	const fetchAudit = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const dto = await apiClient.getApiAuditoriesV1CompanyEntityAudits(parseInt(id!, 10));
			setAudit(dto);
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

	const handleBack = () => navigate('/company-entity-audits');
	const handleEdit = () => navigate(`/company-entity-audit/edit/${id}`);

	if (loading) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<div className="header-actions">
						<div style={{ width: '80px' }}></div>
						<h1>{t('ViewCompanyEntityAuditPage_Title') || 'Company Entity Audit'}</h1>
						<div style={{ width: '80px' }}></div>
					</div>
				</div>
				<div className="profile-card">
					<div className="loading">{t('Page_LoadingData')}</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="user-profile-page">
				<div className="profile-header">
					<div className="header-actions">
						<button className="back-button" onClick={handleBack}>
							← {t('Button_Back')}
						</button>
						<h1>{t('ViewCompanyEntityAuditPage_Title') || 'Company Entity Audit'}</h1>
						<div style={{ width: '80px' }}></div>
					</div>
				</div>
				<div className="profile-card">
					<div className="form-error">{error}</div>
				</div>
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
					<h1>{t('ViewCompanyEntityAuditPage_Title') || 'Company Entity Audit'}</h1>
					<div style={{ width: '80px' }}></div>
				</div>
			</div>

			<div className="profile-card">
				<div className="profile-avatar-section">
					<div className="profile-avatar-large-initials">
						{(audit?.auditTypeNameTranslationKey || audit?.entityName || 'A').charAt(0).toUpperCase()}
					</div>
					<h2 className="profile-name">
						{audit?.auditTypeNameTranslationKey || audit?.entityName || t('ViewCompanyEntityAuditPage_Title')}
					</h2>
				</div>

				<div className="profile-info-grid">
					<div className="info-row">
						<span className="info-label">{t('Label_Id')}</span>
						<span className="info-value">{audit?.id ?? 'N/A'}</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_Company')}</span>
						<span className="info-value">{audit?.companyNameTranslationKey ?? audit?.companyFk ?? 'N/A'}</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_EntitySchema')}</span>
						<span className="info-value">{audit?.entitySchemaName ?? 'N/A'}</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_EntityName')}</span>
						<span className="info-value">{audit?.entityName ?? 'N/A'}</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_AuditType')}</span>
						<span className="info-value">{audit?.auditTypeNameTranslationKey ?? audit?.auditTypeFk ?? 'N/A'}</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_Status')}</span>
						<span className="info-value">
							{audit?.isActive ? t('Label_Active') : t('Label_Inactive')}
						</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_CreatedDate')}</span>
						<span className="info-value">
							{audit?.creationDate ? new Date(audit.creationDate).toLocaleString() : 'N/A'}
						</span>
					</div>
					<div className="info-row">
						<span className="info-label">{t('Label_LastUpdateDate')}</span>
						<span className="info-value">
							{audit?.lastUpdateDate ? new Date(audit.lastUpdateDate).toLocaleString() : 'N/A'}
						</span>
					</div>
				</div>

				<div className="profile-actions">
					<button className="secondary-button" onClick={handleEdit}>
						{t('Button_Edit')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewCompanyEntityAudit;



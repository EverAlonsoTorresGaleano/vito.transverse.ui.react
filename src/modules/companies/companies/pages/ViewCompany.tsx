import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { CompanyDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewCompany: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const companyId = parseInt(id, 10);
        if (isNaN(companyId)) {
          throw new Error('Invalid company ID');
        }
        const companyData = await apiClient.getApiCompaniesV1(companyId);
        setCompany(companyData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load company information';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleEdit = () => {
    if (company?.id) {
      navigate(`/company/edit/${company.id}`);
    }
  };

  const handleBack = () => {
    navigate('/companies');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('Label_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewCompanyPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
        ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewCompanyPage_Title')}</h1>
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
          <h1>{t('ViewCompanyPage_Title')}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit')}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          {company.avatar ? (
            <img src={company.avatar} alt={company.nameTranslationKey || 'Company'} className="profile-avatar-large" />
          ) : (
            <div className="profile-avatar-large-initials">
              {company.nameTranslationKey ? company.nameTranslationKey.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <h2 className="profile-name">
            {company.nameTranslationKey || t('Label_NoName')}
          </h2>
          {company.subdomain && (
            <p className="profile-username">@{company.subdomain}</p>
          )}
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('ViewCompanyPage_BasicInfo')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_CompanyId')}</label>
                <div className="detail-value">{company.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Name')}</label>
                <div className="detail-value">{company.nameTranslationKey || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Email')}</label>
                <div className="detail-value">{company.email || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Subdomain')}</label>
                <div className="detail-value">{company.subdomain || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Description')}</label>
                <div className="detail-value">{company.descriptionTranslationKey || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">{t('ViewCompanyPage_Status')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Status')}</label>
                <div className="detail-value">
                  <span className={`status-badge ${company.isActive ? 'active' : 'inactive'}`}>
                    {company.isActive ? t('GridView_Active') : t('GridView_Inactive')}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <label>{t('Label_SystemCompany')}</label>
                <div className="detail-value">
                  {company.isSystemCompany ? t('Label_Yes') : t('Label_No')}
                </div>
              </div>
              <div className="detail-item">
                <label>{t('Label_DefaultCulture')}</label>
                <div className="detail-value">{company.defaultCultureFk || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Country')}</label>
                <div className="detail-value">
                  {company.countryNameTranslationKey || company.countryFk || 'N/A'}
                </div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Language')}</label>
                <div className="detail-value">
                  { t(company.languageNameTranslationKey || '') || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {(company.creationDate || company.lastUpdateDate) && (
            <div className="detail-section">
              <h3 className="section-title">{t('ViewCompanyPage_AccountInfo')}</h3>
              <div className="detail-grid">
                {company.creationDate && (
                  <div className="detail-item">
                    <label>{t('Label_CreationDate')}</label>
                    <div className="detail-value">
                      {new Date(company.creationDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {company.lastUpdateDate && (
                  <div className="detail-item">
                    <label>{t('Label_LastUpdate')}</label>
                    <div className="detail-value">
                      {new Date(company.lastUpdateDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {company.createdByUserFk && (
                  <div className="detail-item">
                    <label>{t('Label_CreatedBy')}</label>
                    <div className="detail-value">{company.createdByUserFk}</div>
                  </div>
                )}
                {company.lastUpdateByUserFk && (
                  <div className="detail-item">
                    <label>{t('Label_UpdatedBy')}</label>
                    <div className="detail-value">{company.lastUpdateByUserFk}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCompany;


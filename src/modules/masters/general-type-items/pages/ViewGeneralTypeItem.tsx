import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { GeneralTypeItemDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const ViewGeneralTypeItem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [item, setItem] = useState<GeneralTypeItemDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError(t('Label_IdRequired'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const itemId = parseInt(id, 10);
        const data = await apiClient.getApiMasterV1GeneralTypeItems(itemId);
        setItem(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, t]);

  const handleEdit = () => {
    if (item?.id) {
      navigate(`/general-type-item/edit/${item.id}`);
    }
  };

  const handleBack = () => {
    navigate('/general-type-items');
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewGeneralTypeItemPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewGeneralTypeItemPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={handleBack} style={{ marginTop: '20px' }}>
          ← {t('Button_Back')}
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('ViewGeneralTypeItemPage_Title')}</h1>
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
          <h1>{t('ViewGeneralTypeItemPage_Title')}</h1>
          <button className="edit-button" onClick={handleEdit}>
            {t('Button_Edit')}
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {item.nameTranslationKey ? item.nameTranslationKey.charAt(0).toUpperCase() : 'I'}
          </div>
          <h2 className="profile-name">
            {item.nameTranslationKey || t('Label_NoName')}
          </h2>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3 className="section-title">{t('Label_Details')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t('Label_Id')}</label>
                <div className="detail-value">{item.id || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Name')}</label>
                <div className="detail-value">{item.nameTranslationKey || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Group')}</label>
                <div className="detail-value">{item.itemGroupNameTranslationKey || item.listItemGroupFk || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_OrderIndex')}</label>
                <div className="detail-value">{item.orderIndex ?? 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>{t('Label_Status')}</label>
                <div className="detail-value">
                  <span className={`status-badge ${item.isEnabled ? 'active' : 'inactive'}`}>
                    {item.isEnabled ? t('GridView_Active') : t('GridView_Inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGeneralTypeItem;



import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { GeneralTypeGroupDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const EditGeneralTypeGroup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [group, setGroup] = useState<GeneralTypeGroupDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameTranslationKey: '',
    isSystemType: false
  });

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        setError(t('Label_IdRequired'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const groupId = parseInt(id, 10);
        const data = await apiClient.getApiMasterV1GeneralTypeGroups(groupId);
        setGroup(data);
        setFormData({
          nameTranslationKey: data.nameTranslationKey || '',
          isSystemType: data.isSystemType ?? false
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!group || !group.id) return;
    try {
      setSaving(true);
      setError(null);
      const updated: GeneralTypeGroupDTO = {
        ...group,
        nameTranslationKey: formData.nameTranslationKey,
        isSystemType: formData.isSystemType
      };
      await apiClient.putApiMasterV1GeneralTypeGroups(updated);
      navigate(`/general-type-group/view/${group.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (group?.id) {
      navigate(`/general-type-group/view/${group.id}`);
    } else {
      navigate('/general-type-groups');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditGeneralTypeGroupPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditGeneralTypeGroupPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => navigate('/general-type-groups')} style={{ marginTop: '20px' }}>
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
          <h1>{t('EditGeneralTypeGroupPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'G'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('Label_Unnamed')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-section">
            <h3 className="section-title">{t('EditGeneralTypeGroupPage_BasicInfo')}</h3>
            <div className="form-grid">
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isSystemType"
                    checked={formData.isSystemType}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <span>{t('Label_IsSystemType')}</span>
                </label>
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

export default EditGeneralTypeGroup;



import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { GeneralTypeItemDTO, ListItemDTO } from '../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const EditGeneralTypeItem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [item, setItem] = useState<GeneralTypeItemDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nameTranslationKey: '',
    listItemGroupFk: '',
    orderIndex: '',
    isEnabled: true
  });
  const [groups, setGroups] = useState<ListItemDTO[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError(t('Label_IdRequired'));
          setLoading(false);
          return;
        }
        const itemId = parseInt(id, 10);
        const data = await apiClient.getApiMasterV1GeneralTypeItems(itemId);
        setItem(data);
        setFormData({
          nameTranslationKey: data.nameTranslationKey || '',
          listItemGroupFk: data.listItemGroupFk ? String(data.listItemGroupFk) : '',
          orderIndex: data.orderIndex !== undefined && data.orderIndex !== null ? String(data.orderIndex) : '',
          isEnabled: data.isEnabled ?? true
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('Label_LoadError');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, t]);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      setGroupsError(null);
      try {
        const list = await apiClient.getApiMasterV1GeneralTypeGroupsDropdown();
        setGroups(list || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load groups';
        setGroupsError(errorMessage);
        console.error('Error fetching groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!item || !item.id) return;
    if (!formData.listItemGroupFk) {
      setError(t('Label_GroupIdRequired'));
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const updated: GeneralTypeItemDTO = {
        ...item,
        nameTranslationKey: formData.nameTranslationKey,
        listItemGroupFk: parseInt(formData.listItemGroupFk, 10),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex, 10) : undefined,
        isEnabled: formData.isEnabled
      };
      await apiClient.putApiMasterV1GeneralTypeItems(updated);
      navigate(`/general-type-item/view/${item.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_UpdateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (item?.id) {
      navigate(`/general-type-item/view/${item.id}`);
    } else {
      navigate('/general-type-items');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditGeneralTypeItemPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="user-profile-page">
        <div className="profile-header">
          <h1>{t('EditGeneralTypeItemPage_Title')}</h1>
        </div>
        <div className="error">{error}</div>
        <button className="back-button" onClick={() => navigate('/general-type-items')} style={{ marginTop: '20px' }}>
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
          <h1>{t('EditGeneralTypeItemPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'I'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('Label_Unnamed')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-section">
            <h3 className="section-title">{t('EditGeneralTypeItemPage_BasicInfo')}</h3>
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
                <label htmlFor="listItemGroupFk">
                  {t('Label_Group')} *
                </label>
                {loadingGroups ? (
                  <div className="form-input" style={{ color: '#666', fontStyle: 'italic' }}>
                    {t('DropDown_LoadingData')}
                  </div>
                ) : groupsError ? (
                  <div className="form-input input-error" style={{ color: '#d32f2f' }}>
                    {groupsError}
                  </div>
                ) : (
                  <select
                    id="listItemGroupFk"
                    name="listItemGroupFk"
                    value={formData.listItemGroupFk}
                    onChange={handleChange}
                    className="form-input"
                    disabled={loadingGroups}
                    required
                  >
                    <option value="">{t('DropDown_SelectOption')}</option>
                    {groups
                      .filter(g => g.isEnabled !== false)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((g) => (
                        <option key={g.id || ''} value={g.id || ''}>
                          {t(g.nameTranslationKey || '') || g.id || 'Unnamed Group'}
                        </option>
                      ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="orderIndex">
                  {t('Label_OrderIndex')}
                </label>
                <input
                  type="number"
                  id="orderIndex"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isEnabled"
                    checked={formData.isEnabled}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <span>{t('Label_IsActive')}</span>
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

export default EditGeneralTypeItem;



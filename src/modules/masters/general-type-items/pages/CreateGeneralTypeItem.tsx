import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../services/apiService';
import { GeneralTypeItemDTO, ListItemDTO } from '../../../../api/vito-transverse-identity-api';
import { useTranslation } from 'react-i18next';
import '../../../../styles/UserProfile.css';

const CreateGeneralTypeItem: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    if (!formData.listItemGroupFk) {
      setError(t('Label_GroupIdRequired'));
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const dto: GeneralTypeItemDTO = {
        nameTranslationKey: formData.nameTranslationKey,
        listItemGroupFk: parseInt(formData.listItemGroupFk, 10),
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex, 10) : undefined,
        isEnabled: formData.isEnabled
      };
      const created = await apiClient.postApiMasterV1GeneralTypeItems(dto);
      navigate(`/general-type-item/view/${created.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('Label_CreateError');
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/general-type-items');
  };

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

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="header-actions">
          <button className="back-button" onClick={handleCancel}>
            ← {t('Button_Cancel')}
          </button>
          <h1>{t('NewGeneralTypeItemPage_Title')}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large-initials">
            {formData.nameTranslationKey ? formData.nameTranslationKey.charAt(0).toUpperCase() : 'I'}
          </div>
          <h2 className="profile-name">
            {formData.nameTranslationKey || t('NewGeneralTypeItemPage_New')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h3 className="section-title">{t('NewGeneralTypeItemPage_BasicInfo')}</h3>
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
              {saving ? t('Button_Saving') : t('Button_Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGeneralTypeItem;



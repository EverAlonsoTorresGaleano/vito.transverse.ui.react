import React, { useState, useEffect, useMemo } from 'react';
import { ApplicationDTO } from '../api/vito-transverse-identity-api';
import { apiClient } from '../services/apiService';
import Pagination from '../components/Pagination/Pagination';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaRedo, FaSearch } from 'react-icons/fa';
import './ApplicationsList.css';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';  

const ApplicationsList: React.FC = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getApiApplicationsV1All();
      setApplications(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      setDeletingId(applicationId);
      await apiClient.deleteApiApplicationsV1Delete(applicationId);
      // Refresh the list after deletion
      await fetchApplications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application';
      alert(errorMessage);
      console.error('Error deleting application:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (applicationId: number) => {
    // TODO: Navigate to view page or show modal
    console.log('View application:', applicationId);
    alert(`View application ${applicationId} - Feature to be implemented`);
  };

  const handleEdit = (applicationId: number) => {
    // TODO: Navigate to edit page or show modal
    console.log('Edit application:', applicationId);
    alert(`Edit application ${applicationId} - Feature to be implemented`);
  };

  // Filter applications based on search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return applications.filter(application => {
      const id = application.id?.toString() || '';
      const name = application.nameTranslationKey?.toLowerCase() || '';
      const companyName = application.companyNameTranslationKey?.toLowerCase() || '';
      const description = application.descriptionTranslationKey?.toLowerCase() || '';
      const status = application.isActive ? 'active' : 'inactive';
      
      return (
        id.includes(searchLower) ||
        name.includes(searchLower) ||
        companyName.includes(searchLower) ||
        description.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [applications, searchTerm]);

  // Calculate pagination based on filtered results
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Reset to page 1 when items per page or search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  if (loading) {
    return (
      <div className="list-page">
        <div className="page-header">
          <h1>{t('ApplicationsListPage_Title')}</h1>
        </div>
        <div className="loading">{t('Page_LoadingData')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page">
        <div className="page-header">
          <h1>Applications</h1>
        </div>
        <div className="error">{error}</div>
        <button className="retry-button" onClick={fetchApplications}>
          <FaRedo /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Applications</h1>
        <p className="page-subtitle">Manage your applications</p>
      </div>
      <div className="list-container">
        <div className="list-card">
          <div className="search-container">
            <div className="search-controls">
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search applications by name, company, description, ID, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="search-clear-button"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <button
                className="new-application-button"
                onClick={() => {
                  // TODO: Navigate to new application page or show modal
                  console.log('New Application clicked');
                  alert('New Application - Feature to be implemented');
                }}
                title="Create new application"
              >
                <FaPlus /> New Application
              </button>
            </div>
            {searchTerm && (
              <div className="search-results-info">
                Showing {filteredApplications.length} of {applications.length} applications
              </div>
            )}
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {searchTerm ? 'No applications match your search criteria' : 'No applications found'}
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map(application => (
                    <tr key={application.id}>
                      <td>{application.id}</td>
                      <td className="name-cell">
                        <div className="cell-content">
                          {application.nameTranslationKey || 'N/A'}
                        </div>
                      </td>
                      <td>{application.companyNameTranslationKey || 'N/A'}</td>
                      <td>
                        <div className="cell-content">
                          {application.descriptionTranslationKey || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${application.isActive ? 'active' : 'inactive'}`}>
                          {application.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {application.creationDate
                          ? new Date(application.creationDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() => handleView(application.id!)}
                            title="View"
                          >
                            <FaEye /> View
                          </button>
                          <button
                            className="action-button edit-button"
                            onClick={() => handleEdit(application.id!)}
                            title="Edit"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDelete(application.id!)}
                            disabled={deletingId === application.id}
                            title="Delete"
                          >
                            <FaTrash /> {deletingId === application.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredApplications.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredApplications.length}
              onItemsPerPageChange={setItemsPerPage}
              itemName="applications"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsList;

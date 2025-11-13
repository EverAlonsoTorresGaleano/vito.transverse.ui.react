import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { authService } from '../utils/auth';
import { Client, ListItemDTO } from '../api/vito-transverse-identity-api';
import config from '../config';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    company: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<ListItemDTO[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<ListItemDTO[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [languagesError, setLanguagesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError(null);
      try {
        const apiClient = new Client(config.api.baseUrl);
        const companiesList = await apiClient.getApiCompaniesV1Dropdown();
        setCompanies(companiesList);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load companies';
        setCompaniesError(errorMessage);
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      setLanguagesError(null);
      try {
        const apiClient = new Client(config.api.baseUrl);
        const languagesList = await apiClient.getApiMasterV1CulturesActiveDropDown();
        setLanguages(languagesList);
        // Set default language if available
        if (languagesList.length > 0 && !selectedLanguage) {
          const defaultLang = languagesList.find(lang => lang.isEnabled !== false) || languagesList[0];
          setSelectedLanguage(defaultLang.id || '');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load languages';
        setLanguagesError(errorMessage);
        console.error('Error fetching languages:', error);
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchCompanies();
    fetchLanguages();
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'User name is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const tokenResponse = await login({
        userName: formData.userName,
        password: formData.password,
        company: formData.company
      });

      if (tokenResponse.access_token) {
        authService.setToken(tokenResponse.access_token);
        // Store user info from token response
        authService.setUserInfo({
          userId: tokenResponse.user_id,
          userName: formData.userName,
          userAvatar: tokenResponse.user_avatar,
          companyId: tokenResponse.company_id
        });
        navigate('/dashboard');
      } else {
        setSubmitError('Login failed: No token received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during login';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Vito Transverse</h1>
            <p className="login-subtitle">Identity Management System</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userName" className="form-label">
                User Name
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={`form-input ${errors.userName ? 'input-error' : ''}`}
                placeholder="Enter your user name"
                disabled={isLoading}
              />
              {errors.userName && (
                <span className="error-message">{errors.userName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Company
              </label>
              {loadingCompanies ? (
                <div className="form-input" style={{ color: '#666', fontStyle: 'italic' }}>
                  Loading companies...
                </div>
              ) : companiesError ? (
                <div className="form-input input-error" style={{ color: '#d32f2f' }}>
                  {companiesError}
                </div>
              ) : (
                <select
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`form-input ${errors.company ? 'input-error' : ''}`}
                  disabled={isLoading || loadingCompanies}
                >
                  <option value="">Select a company</option>
                  {companies
                    .filter(company => company.isEnabled !== false)
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((company) => (
                      <option key={company.id || ''} value={company.id || ''}>
                        {company.nameTranslationKey || company.id || 'Unnamed Company'}
                      </option>
                    ))}
                </select>
              )}
              {errors.company && (
                <span className="error-message">{errors.company}</span>
              )}
            </div>

            {submitError && (
              <div className="submit-error">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="language-group">
              <label htmlFor="language" className="language-label">
                Language
              </label>
              {loadingLanguages ? (
                <div className="language-dropdown" style={{ color: '#666', fontStyle: 'italic' }}>
                  Loading...
                </div>
              ) : languagesError ? (
                <div className="language-dropdown" style={{ color: '#d32f2f' }}>
                  {languagesError}
                </div>
              ) : (
                <select
                  id="language"
                  name="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-dropdown"
                  disabled={isLoading || loadingLanguages}
                >
                  <option value="">Select a language</option>
                  {languages
                    .filter(lang => lang.isEnabled !== false)
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((language) => (
                      <option key={language.id || ''} value={language.id || ''}>
                        {language.nameTranslationKey || language.id || 'Unnamed Language'}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


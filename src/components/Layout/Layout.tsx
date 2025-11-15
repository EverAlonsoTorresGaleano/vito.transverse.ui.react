import React, { useState } from 'react';
import AccordionMenu from '../AccordionMenu/AccordionMenu';
import UserAvatar from '../UserAvatar/UserAvatar';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useTranslation } from 'react-i18next';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useTranslation();
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <AccordionMenu isCollapsed={sidebarCollapsed} />
      </aside>
      <button 
        className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg 
          className="toggle-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d={sidebarCollapsed ? "M7 4L13 10L7 16" : "M13 4L7 10L13 16"} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={`layout-content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="layout-header">
          <div className="header-content">
            <h1 className="header-title">{t('Application_Title')}</h1>
            <div className="header-actions">
              <LanguageSelector showSelectedLanguage={false} showLabel={false} setDefaultLanguage={false} />
              <UserAvatar />
            </div>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;



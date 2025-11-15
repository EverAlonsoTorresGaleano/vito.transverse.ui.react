import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './AccordionMenu.css';
import { MenuGroupDTO } from '../../api/vito-transverse-identity-api';
import { apiClient } from '../../services/apiService';
import { getIconComponent } from '../../utils/iconMapper';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

interface MenuGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string | undefined;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string | undefined;
  path: string;
}

interface AccordionMenuProps {
  isCollapsed?: boolean;
}

const AccordionMenu: React.FC<AccordionMenuProps> = ({ isCollapsed = false }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);
  const [groupPopoverPosition, setGroupPopoverPosition] = useState<{ top: number; left: number; side: 'left' | 'right' } | null>(null);
  const [menuItemPopoverPosition, setMenuItemPopoverPosition] = useState<{ top: number; left: number; side: 'left' | 'right' } | null>(null);
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiMenuGroups = await apiClient.getApiUsersV1Menu();
        
        // Transform API data to internal format
        const transformedGroups: MenuGroup[] = (apiMenuGroups || []).map((apiGroup: MenuGroupDTO) => ({
          id: apiGroup.id || `group-${Math.random()}`,
          title: apiGroup.title || 'Untitled',
          icon: getIconComponent(apiGroup.icon),
          description: apiGroup.description,
          items: (apiGroup.items || []).map((apiItem) => ({
            id: apiItem.id || `item-${Math.random()}`,
            label: apiItem.title || 'Untitled',
            icon: getIconComponent(apiItem.icon),
            description: apiItem.description,
            path: apiItem.path || '#'
          }))
        }));
        
        setMenuGroups(transformedGroups);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load menu';
        setError(errorMessage);
        console.error('Error fetching menu data:', err);
        // Fallback to empty array on error
        setMenuGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Auto-expand groups when their route is active
  useEffect(() => {
    if (menuGroups.length > 0) {
      menuGroups.forEach(group => {
        const hasActiveItem = group.items.some(item => 
          location.pathname === item.path
        );
        if (hasActiveItem) {
          setExpandedGroups(prev => {
            const newSet = new Set(prev);
            newSet.add(group.id);
            return newSet;
          });
        }
      });
    }
  }, [location.pathname, menuGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  return (
    <nav className={`accordion-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="menu-header">
        <h2>{isCollapsed ? '' : 'Navigation'}</h2>
      </div>
      <div className="menu-dashboard-link">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => 
            `dashboard-menu-link ${isActive ? 'active' : ''}`
          }
        >
          <span className="dashboard-icon">📊</span>
          {!isCollapsed && <span>{t('DashboardPage_Title')}</span>}
        </NavLink>
      </div>
      {loading && (
        <div className="menu-loading">
          <div className="loading-spinner"></div>
          <span>{t('Menu_LoadingMenu')}</span>
        </div>
      )}
      {error && (
        <div className="menu-error">
          <span>⚠️ {error}</span>
        </div>
      )}
      {!loading && !error && menuGroups.length === 0 && (
        <div className="menu-empty">
          <span>{t('AccordionMenu_NoMenuItemsAvailable')}</span>
        </div>
      )}
      <ul className="menu-groups">
        {menuGroups.map(group => {
          const isExpanded = expandedGroups.has(group.id);
          return (
            <li key={group.id} className="menu-group">
              <div 
                className="group-header-wrapper"
                onMouseEnter={(e) => {
                  if (group.description) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const popoverWidth = 280;
                    const spaceOnRight = window.innerWidth - rect.right;
                    
                    // Position on right by default, left if not enough space
                    const isLeftSide = spaceOnRight < popoverWidth + 20;
                    const left = isLeftSide 
                      ? rect.left - popoverWidth - 12 
                      : rect.right + 12;
                    
                    setGroupPopoverPosition({
                      top: rect.top + rect.height / 2,
                      left: left,
                      side: isLeftSide ? 'left' : 'right'
                    });
                    setHoveredGroup(group.id);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredGroup(null);
                }}
              >
                <button
                  className={`group-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="group-icon-wrapper">
                    {group.icon}
                  </span>
                  {!isCollapsed && <span className="group-title">{t(group.title)}</span>}
                  <span className={`group-arrow ${isExpanded ? 'expanded' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                {group.description && hoveredGroup === group.id && groupPopoverPosition && (
                  <div 
                    className="group-popover"
                    style={{
                      top: `${groupPopoverPosition.top}px`,
                      left: `${groupPopoverPosition.left}px`,
                      transform: 'translateY(-50%)'
                    }}
                    onMouseEnter={() => setHoveredGroup(group.id)}
                    onMouseLeave={() => setHoveredGroup(null)}
                  >
                    <div className="popover-content">
                      <div className="popover-header">
                        <span className="popover-icon">{group.icon}</span>
                        <span className="popover-title">{t(group.title)}</span>
                      </div>
                      <div className="popover-body">
                        <p>{t( group.description)}</p>
                      </div>
                      <div 
                        className="popover-arrow"
                        style={{
                          left: groupPopoverPosition.side === 'right' ? '-8px' : 'auto',
                          right: groupPopoverPosition.side === 'left' ? '-8px' : 'auto',
                          borderRight: groupPopoverPosition.side === 'right' ? '8px solid #1e3a5f' : 'none',
                          borderLeft: groupPopoverPosition.side === 'left' ? '8px solid #1e3a5f' : 'none'
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {isExpanded && (
                <ul className="group-items">
                  {group.items.map(item => (
                    <li key={item.id} className="menu-item">
                      <div 
                        className={`menu-item-wrapper ${hoveredMenuItem === item.id ? 'popover-visible' : ''}`}
                        onMouseEnter={(e) => {
                          if (item.description) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const popoverWidth = 280;
                            const spaceOnRight = window.innerWidth - rect.right;
                            
                            // Position on right by default, left if not enough space
                            const isLeftSide = spaceOnRight < popoverWidth + 20;
                            const left = isLeftSide 
                              ? rect.left - popoverWidth - 12 
                              : rect.right + 12;
                            
                            setMenuItemPopoverPosition({
                              top: rect.top + rect.height / 2,
                              left: left,
                              side: isLeftSide ? 'left' : 'right'
                            });
                            setHoveredMenuItem(item.id);
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredMenuItem(null);
                        }}
                      >
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => 
                            `menu-link ${isActive ? 'active' : ''}`
                          }
                        >
                          <span className="menu-item-icon">{item.icon}</span> {t(item.label)}
                        </NavLink>
                        <button
                          className="menu-item-collapse-button"
                          aria-label="Toggle description"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {item.description && hoveredMenuItem === item.id && menuItemPopoverPosition && (
                          <div 
                            className="menu-item-popover"
                            style={{
                              top: `${menuItemPopoverPosition.top}px`,
                              left: `${menuItemPopoverPosition.left}px`,
                              transform: 'translateY(-50%)'
                            }}
                            onMouseEnter={() => setHoveredMenuItem(item.id)}
                            onMouseLeave={() => setHoveredMenuItem(null)}
                          >
                            <div className="popover-content">
                              <div className="popover-header">
                                <span className="popover-icon">{item.icon}</span>
                                <span className="popover-title">{t(item.label)}</span>
                              </div>
                              <div className="popover-body">
                                <p>{t(item.description)}</p>
                              </div>
                              <div 
                                className="popover-arrow"
                                style={{
                                  left: menuItemPopoverPosition.side === 'right' ? '-8px' : 'auto',
                                  right: menuItemPopoverPosition.side === 'left' ? '-8px' : 'auto',
                                  borderRight: menuItemPopoverPosition.side === 'right' ? '8px solid #1e3a5f' : 'none',
                                  borderLeft: menuItemPopoverPosition.side === 'left' ? '8px solid #1e3a5f' : 'none'
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AccordionMenu;


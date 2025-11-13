import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import * as HiIcons from 'react-icons/hi';

// Map icon name strings to React icon components
export const getIconComponent = (iconName?: string): React.ReactNode => {
  if (!iconName) {
    return <FaIcons.FaCircle />; // Default icon
  }

  // Normalize icon name (remove spaces, convert to camelCase)
  const normalizedName = iconName
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '');

  // Try to find icon in different icon libraries
  // Font Awesome
  const faIcon = (FaIcons as any)[normalizedName] || (FaIcons as any)[`Fa${normalizedName}`];
  if (faIcon) {
    return React.createElement(faIcon);
  }

  // Material Design
  const mdIcon = (MdIcons as any)[normalizedName] || (MdIcons as any)[`Md${normalizedName}`];
  if (mdIcon) {
    return React.createElement(mdIcon);
  }

  // Ionicons
  const ioIcon = (IoIcons as any)[normalizedName] || (IoIcons as any)[`Io${normalizedName}`];
  if (ioIcon) {
    return React.createElement(ioIcon);
  }

  // Heroicons
  const hiIcon = (HiIcons as any)[normalizedName] || (HiIcons as any)[`Hi${normalizedName}`];
  if (hiIcon) {
    return React.createElement(hiIcon);
  }

  // Common icon name mappings
  const iconMap: { [key: string]: React.ReactNode } = {
    'applications': <FaIcons.FaTh />,
    'application': <FaIcons.FaTh />,
    'apps': <FaIcons.FaTh />,
    'companies': <FaIcons.FaBuilding />,
    'company': <FaIcons.FaBuilding />,
    'users': <FaIcons.FaUsers />,
    'user': <FaIcons.FaUser />,
    'roles': <FaIcons.FaUserShield />,
    'role': <FaIcons.FaUserShield />,
    'dashboard': <FaIcons.FaChartBar />,
    'list': <FaIcons.FaList />,
    'showlist': <FaIcons.FaList />,
    'show-list': <FaIcons.FaList />,
  };

  const lowerName = normalizedName.toLowerCase();
  if (iconMap[lowerName]) {
    return iconMap[lowerName];
  }

  // Default fallback
  return <FaIcons.FaCircle />;
};


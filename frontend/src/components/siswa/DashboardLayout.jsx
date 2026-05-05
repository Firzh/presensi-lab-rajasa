/**
 * Dashboard Siswa Layout Component
 * 
 * Main layout wrapper for student dashboard featuring:
 * - Header navigation (Level 2)
 * - Dynamic sidebar navigation (Level 3)
 * - Main content area
 * - Logout functionality
 * 
 * @module components/siswa/DashboardLayout
 * @author SMK Rajasa Development Team
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import auth from '../../utils/auth';
import './DashboardLayout.css';

/**
 * Navigation menu configuration for Level 2 (Header)
 */
const HEADER_MENU = [
  {
    id: 'dashboard',
    label: 'Dashboard Siswa',
    path: '/dashboard/siswa',
    icon: 'home'
  },
  {
    id: 'presensi',
    label: 'Presensi',
    path: '/dashboard/siswa/presensi',
    icon: 'calendar'
  },
  {
    id: 'nilai',
    label: 'Nilai',
    path: '/dashboard/siswa/nilai',
    icon: 'grade'
  }
];

/**
 * Sidebar menu configuration for Level 3 (Sidebar)
 * Dynamically shown based on active header menu
 */
const SIDEBAR_MENU = {
  dashboard: [
    {
      id: 'dashboard-presensi',
      label: 'Presensi',
      path: '/dashboard/siswa/overview/presensi',
      icon: 'check-circle'
    },
    {
      id: 'dashboard-nilai',
      label: 'Nilai',
      path: '/dashboard/siswa/overview/nilai',
      icon: 'star'
    },
    {
      id: 'dashboard-kalender',
      label: 'Kalender Akademik',
      path: '/dashboard/siswa/overview/kalender-akademik',
      icon: 'calendar-days'
    }
  ],
  presensi: [], // Empty sidebar for presensi page (table with filters)
  nilai: [] // Empty sidebar for nilai page (TBD)
};

/**
 * HomeIcon Component
 */
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );
}

/**
 * CalendarIcon Component
 */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
    </svg>
  );
}

/**
 * GradeIcon Component
 */
function GradeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );
}

/**
 * CheckCircleIcon Component
 */
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="sidebar-icon">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

/**
 * StarIcon Component
 */
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="sidebar-icon">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );
}

/**
 * CalendarDaysIcon Component
 */
function CalendarDaysIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="sidebar-icon">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
    </svg>
  );
}

/**
 * LogoutIcon Component
 */
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="sidebar-icon">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  );
}

/**
 * Get icon component based on icon name
 */
function getIcon(iconName) {
  const icons = {
    home: <HomeIcon />,
    calendar: <CalendarIcon />,
    grade: <GradeIcon />,
    'check-circle': <CheckCircleIcon />,
    star: <StarIcon />,
    'calendar-days': <CalendarDaysIcon />,
    logout: <LogoutIcon />
  };
  return icons[iconName] || null;
}

/**
 * DashboardLayout Component
 * 
 * @param {Object} props - Component props
 * @param {import('preact').ComponentChildren} props.children - Child components to render in main content
 * @param {string} props.activePage - Current active page ID
 * @returns {import('preact').VNode} Dashboard layout
 */
export default function DashboardLayout({ children, activePage = 'dashboard' }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Get user data from auth
    const userData = auth.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      auth.logout();
    }
  };

  /**
   * Handle header menu click
   */
  const handleHeaderMenuClick = (menuItem) => {
    route(menuItem.path);
  };

  /**
   * Handle sidebar menu click
   */
  const handleSidebarMenuClick = (menuItem) => {
    route(menuItem.path);
  };

  /**
   * Get active header menu
   */
  const getActiveHeaderMenu = () => {
    return HEADER_MENU.find(menu => menu.id === activePage) || HEADER_MENU[0];
  };

  /**
   * Get sidebar menu items based on active page
   */
  const getSidebarMenuItems = () => {
    return SIDEBAR_MENU[activePage] || [];
  };

  const activeHeaderMenu = getActiveHeaderMenu();
  const sidebarMenuItems = getSidebarMenuItems();

  return (
    <div className="dashboard-layout">
      {/* Header Navigation - Level 2 */}
      <header className="dashboard-header">
        <div className="header-container">
          {/* Logo & Brand */}
          <div className="header-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1>SMK Rajasa</h1>
              <p>Sistem Presensi Lab</p>
            </div>
          </div>

          {/* Header Navigation Menu */}
          <nav className="header-nav">
            {HEADER_MENU.map(menuItem => (
              <button
                key={menuItem.id}
                className={`header-nav-item ${activePage === menuItem.id ? 'active' : ''}`}
                onClick={() => handleHeaderMenuClick(menuItem)}
              >
                {getIcon(menuItem.icon)}
                <span>{menuItem.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="header-user">
            <div className="user-avatar">
              <span>{user?.nama_lengkap?.charAt(0) || 'S'}</span>
            </div>
            <div className="user-info">
              <p className="user-name">{user?.nama_lengkap || 'Siswa'}</p>
              <p className="user-role">{user?.kelas_aktif || 'Siswa'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="dashboard-main-container">
        {/* Sidebar Navigation - Level 3 */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            {/* Sidebar Menu Items */}
            {sidebarMenuItems.length > 0 && (
              <nav className="sidebar-nav">
                <p className="sidebar-nav-title">Menu</p>
                {sidebarMenuItems.map(menuItem => (
                  <button
                    key={menuItem.id}
                    className="sidebar-nav-item"
                    onClick={() => handleSidebarMenuClick(menuItem)}
                  >
                    {getIcon(menuItem.icon)}
                    <span>{menuItem.label}</span>
                  </button>
                ))}
              </nav>
            )}

            {/* Logout Button - Always at bottom */}
            <div className="sidebar-footer">
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                {getIcon('logout')}
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Level 4 */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

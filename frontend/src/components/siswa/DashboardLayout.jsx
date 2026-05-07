/**
 * Dashboard Siswa Layout Component
 * 
 * Clean admin panel style layout matching the prototype design:
 * - White sidebar on the left with navigation menu
 * - White header on top with search and user profile
 * - Light gray content area
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
 * Navigation menu configuration
 * Follows the sidebar structure from prototype
 */
const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    path: '/dashboard/siswa',
    submenu: [
      {
        id: 'dashboard-presensi',
        label: 'Presensi',
        path: '/dashboard/siswa/overview/presensi'
      },
      {
        id: 'dashboard-nilai',
        label: 'Nilai',
        path: '/dashboard/siswa/overview/nilai'
      },
      {
        id: 'dashboard-kalender',
        label: 'Kalender Akademik',
        path: '/dashboard/siswa/overview/kalender-akademik'
      }
    ]
  },
  {
    id: 'presensi',
    label: 'Presensi',
    icon: 'calendar',
    path: '/dashboard/siswa/presensi',
    submenu: [] // Empty submenu - shows table with filters directly
  },
  {
    id: 'nilai',
    label: 'Nilai',
    icon: 'grade',
    path: '/dashboard/siswa/nilai',
    submenu: [] // TBD
  }
];

/**
 * Icon Components matching prototype style
 */
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
    </svg>
  );
}

function GradeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  );
}

/**
 * Get icon component by name
 */
function getIcon(iconName) {
  const icons = {
    home: <HomeIcon />,
    calendar: <CalendarIcon />,
    grade: <GradeIcon />,
    search: <SearchIcon />,
    bell: <BellIcon />,
    moon: <MoonIcon />,
    logout: <LogoutIcon />,
    chevronDown: <ChevronDownIcon />
  };
  return icons[iconName] || null;
}

/**
 * DashboardLayout Component
 * 
 * @param {Object} props - Component props
 * @param {import('preact').ComponentChildren} props.children - Child components
 * @param {string} props.activePage - Current active page ID
 * @param {string} props.activeSubmenu - Current active submenu ID
 * @returns {import('preact').VNode} Dashboard layout
 */
export default function DashboardLayout({ children, activePage = 'dashboard', activeSubmenu = null }) {
  const [user, setUser] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(activePage);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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
   * Handle menu item click
   */
  const handleMenuClick = (menuItem) => {
    if (menuItem.submenu && menuItem.submenu.length > 0) {
      // Toggle expand/collapse
      setExpandedMenu(expandedMenu === menuItem.id ? null : menuItem.id);
    } else {
      // Navigate directly
      route(menuItem.path);
    }
  };

  /**
   * Handle submenu click
   */
  const handleSubmenuClick = (submenuItem) => {
    route(submenuItem.path);
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    if (!user?.nama_lengkap) return 'S';
    const names = user.nama_lengkap.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return user.nama_lengkap[0];
  };

  return (
    <div className="dashboard-layout-v2">
      {/* Sidebar */}
      <aside className="sidebar-v2">
        {/* Logo & Brand */}
        <div className="sidebar-header">
          <div className="brand-logo-v2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <div className="brand-text-v2">
            <h1>Presensi Lab</h1>
            <p>SMK RAJASA SURABAYA</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav-v2">
          {MENU_ITEMS.map(menuItem => (
            <div key={menuItem.id} className="nav-item-wrapper">
              <button
                className={`nav-item-v2 ${activePage === menuItem.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(menuItem)}
              >
                <span className="nav-icon-v2">{getIcon(menuItem.icon)}</span>
                <span className="nav-label-v2">{menuItem.label}</span>
                {menuItem.submenu && menuItem.submenu.length > 0 && (
                  <span className={`nav-arrow ${expandedMenu === menuItem.id ? 'expanded' : ''}`}>
                    {getIcon('chevronDown')}
                  </span>
                )}
              </button>

              {/* Submenu */}
              {menuItem.submenu && menuItem.submenu.length > 0 && expandedMenu === menuItem.id && (
                <div className="submenu-v2">
                  {menuItem.submenu.map(submenuItem => (
                    <button
                      key={submenuItem.id}
                      className={`submenu-item-v2 ${activeSubmenu === submenuItem.id ? 'active' : ''}`}
                      onClick={() => handleSubmenuClick(submenuItem)}
                    >
                      {submenuItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer-v2">
          <button className="logout-btn-v2" onClick={handleLogout}>
            <span className="logout-icon">{getIcon('logout')}</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-container-v2">
        {/* Top Header */}
        <header className="header-v2">
          {/* Search Bar */}
          <div className="search-bar-v2">
            <span className="search-icon">{getIcon('search')}</span>
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Header Actions */}
          <div className="header-actions-v2">
            {/* Dark Mode Toggle */}
            <button className="icon-btn-v2" title="Mode Gelap">
              {getIcon('moon')}
            </button>

            {/* Notifications */}
            <button className="icon-btn-v2" title="Notifikasi">
              {getIcon('bell')}
            </button>

            {/* User Profile */}
            <div className="user-profile-v2">
              <div className="user-avatar-v2">
                {getUserInitials()}
              </div>
              <div className="user-info-v2">
                <p className="user-name-v2">{user?.nama_lengkap || 'Siswa'}</p>
                <p className="user-role-v2">{user?.kelas_aktif || 'Siswa'}</p>
              </div>
              <span className="user-dropdown-icon">{getIcon('chevronDown')}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area-v2">
          {children}
        </main>
      </div>
    </div>
  );
}

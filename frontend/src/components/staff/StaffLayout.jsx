/**
 * StaffLayout.jsx
 *
 * Root layout for the staff dashboard.
 *
 * Level 2 — Header tabs:
 *   - Dashboard Staff
 *   - Sesi
 *   - Logout (bottom sidebar)
 *
 * Level 3 — Sidebar (dynamic per tab):
 *   Dashboard Staff → Lihat Sesi Aktif
 *   Sesi            → Buat Sesi Piket, Rekap Global
 *
 * @author fashich/dashboard-staff-page
 */

import { useState, useEffect, useCallback } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import './StaffLayout.css'

const THEME_KEY = STORAGE_KEYS.THEME ?? 'presensi_lab_rajasa:theme'

// ─── Icons ──────────────────────────────────────────────────────────────────
function IconMenu()      { return <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg> }
function IconSchool() {
  return (
    <img
      src="/images/RajasaLogo.png"
      alt="Logo SMK Rajasa"
      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }}
    />
  )
}
function IconDashboard() { return <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> }
function IconSesi()      { return <svg viewBox="0 0 24 24"><path d="M19 3h-4.18A3 3 0 0 0 9.18 3H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 18H5V5h2v3h10V5h2v16z"/></svg> }
function IconEye()       { return <svg viewBox="0 0 24 24"><path d="M12 5c5.3 0 8.9 3.6 10.3 7-1.4 3.4-5 7-10.3 7s-8.9-3.6-10.3-7C3.1 8.6 6.7 5 12 5zm0 11.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4zm0-2.3a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8z"/></svg> }
function IconPlus()      { return <svg viewBox="0 0 24 24"><path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> }
function IconChart()     { return <svg viewBox="0 0 24 24"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zM16 13h3v6h-3v-6z"/></svg> }
function IconLogout()    { return <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z"/></svg> }
function IconTheme()     {
  return (
    <img
      src="/icon/circle-half-stroke-solid-full.svg"
      alt=""
      style={{ width: 20, height: 20, display: 'block', filter: 'var(--theme-toggle-icon-filter, none)' }}
    />
  )
}

// ─── Nav config ─────────────────────────────────────────────────────────────

const NAV_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard Staff',
    icon: <IconDashboard />,
    sidebar: [
      { id: 'sesi-aktif', label: 'Lihat Sesi Aktif', icon: <IconEye /> },
    ],
  },
  {
    id: 'sesi',
    label: 'Sesi',
    icon: <IconSesi />,
    sidebar: [
      { id: 'buat-sesi', label: 'Buat Sesi Piket', icon: <IconPlus /> },
      { id: 'rekap',     label: 'Rekap Global',    icon: <IconChart /> },
    ],
  },
]

// ─── Header ──────────────────────────────────────────────────────────────────

function StaffHeader({ activeTab, onTabChange, onToggleSidebar, onToggleTheme, theme, user }) {
  const initials = (user?.nama_lengkap || user?.username || 'S').charAt(0).toUpperCase()

  return (
    <header className="staff-header" role="banner">
      <button type="button" className="staff-header-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <IconMenu />
      </button>

      <div className="staff-header-brand">
        <div className="staff-header-brand-icon" aria-hidden="true"><IconSchool /></div>
        <span className="staff-header-brand-text">Presensi Lab</span>
      </div>

      <nav className="staff-header-nav" role="navigation" aria-label="Menu utama staff">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`staff-header-nav-item${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="staff-header-toggle"
        onClick={onToggleTheme}
        aria-label={theme === 'light' ? 'Mode gelap' : 'Mode terang'}
        style={{ marginLeft: 'auto' }}
      >
        <IconTheme />
      </button>

      <div className="staff-header-user">
        <div className="staff-header-user-avatar" aria-hidden="true">{initials}</div>
        <div className="staff-header-user-info">
          <span className="staff-header-user-name">{user?.nama_lengkap || user?.username || 'Staff'}</span>
          <span className="staff-header-user-role">Staff</span>
        </div>
      </div>
    </header>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function StaffSidebar({ collapsed, activeTab, activePage, onPageChange, onLogout, isLoggingOut }) {
  const sidebarItems = NAV_TABS.find((t) => t.id === activeTab)?.sidebar ?? []

  return (
    <aside className="staff-sidebar" aria-label="Sidebar navigasi staff">
      <div className="staff-sidebar-brand">
        <div className="staff-sidebar-brand-icon"><IconSchool /></div>
        {!collapsed && (
          <div className="staff-sidebar-brand-text">
            <strong>SMK Rajasa</strong>
            <span>Sistem Presensi</span>
          </div>
        )}
      </div>

      <nav className="staff-sidebar-nav" role="navigation">
        {sidebarItems.length > 0 ? (
          <>
            {!collapsed && <div className="staff-sidebar-nav-label">Menu</div>}
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`staff-sidebar-nav-item${activePage === item.id ? ' active' : ''}`}
                onClick={() => onPageChange(item.id)}
                aria-current={activePage === item.id ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </>
        ) : (
          !collapsed && <p className="staff-sidebar-empty">Tidak ada menu tambahan.</p>
        )}
      </nav>

      <div className="staff-sidebar-footer">
        <button
          type="button"
          className="staff-sidebar-logout"
          onClick={onLogout}
          disabled={isLoggingOut}
          title={collapsed ? 'Keluar' : undefined}
        >
          <span className="nav-icon" aria-hidden="true"><IconLogout /></span>
          {!collapsed && <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function StaffLayout({ user, onLogout, renderPage }) {
  const [activeTab,    setActiveTab]    = useState('dashboard')
  const [activePage,   setActivePage]   = useState('sesi-aktif')
  const [collapsed,    setCollapsed]    = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [theme,        setTheme]        = useState(() => appStorage.getRaw(THEME_KEY) || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    appStorage.setRaw(THEME_KEY, theme)
  }, [theme])

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    const tab = NAV_TABS.find((t) => t.id === tabId)
    setActivePage(tab?.sidebar[0]?.id ?? null)
  }, [])

  const handleToggleTheme = useCallback(() => setTheme((t) => t === 'light' ? 'dark' : 'light'), [])
  const handleToggle      = useCallback(() => setCollapsed((p) => !p), [])

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
    } catch { /* ignore */ } finally {
      appStorage.remove(STORAGE_KEYS.AUTH_TOKEN)
      appStorage.remove(STORAGE_KEYS.AUTH_USER)
      setIsLoggingOut(false)
      if (typeof onLogout === 'function') onLogout()
    }
  }, [isLoggingOut, onLogout])

  return (
    <div className={`staff-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <StaffHeader
        activeTab={activeTab} onTabChange={handleTabChange}
        onToggleSidebar={handleToggle} onToggleTheme={handleToggleTheme}
        theme={theme} user={user}
      />
      <StaffSidebar
        collapsed={collapsed} activeTab={activeTab}
        activePage={activePage} onPageChange={setActivePage}
        onLogout={handleLogout} isLoggingOut={isLoggingOut}
      />
      <main className="staff-content" id="main-content">
        <div className="staff-page-content">
          {typeof renderPage === 'function' ? renderPage(activeTab, activePage) : null}
        </div>
      </main>
    </div>
  )
}

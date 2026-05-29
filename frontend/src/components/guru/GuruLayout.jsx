/**
 * GuruLayout.jsx
 *
 * Root layout for the teacher (guru) dashboard.
 *
 * Level 2 — Header tabs:
 *   - Dashboard Guru
 *   - Presensi
 *   - Logout (bottom of sidebar)
 *
 * Level 3 — Sidebar (dynamic per active tab):
 *   Dashboard Guru → Buat Sesi Presensi
 *   Presensi       → Lihat Sesi Aktif, Rekap Presensi
 *
 * Architecture reference: HTA-Guru-Magang-SMK-Rajasa-Siswa.png
 * Font: Poppins 16.5 (per FigJam spec)
 *
 * @module components/guru/GuruLayout
 * @author fashich/dashboard-guru-page
 */

import { useState, useCallback } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import './GuruLayout.css'

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function IconMenu() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
}

function IconSchool() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
}

function IconDashboard() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
}

function IconClipboard() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3h-4.18A3 3 0 0 0 9.18 3H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 18H5V5h2v3h10V5h2v16z"/></svg>
}

function IconPlus() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
}

function IconEye() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.3 0 8.9 3.6 10.3 7-1.4 3.4-5 7-10.3 7s-8.9-3.6-10.3-7C3.1 8.6 6.7 5 12 5zm0 11.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4zm0-2.3a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8z"/></svg>
}

function IconChart() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zM16 13h3v6h-3v-6z"/></svg>
}

function IconLogout() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z"/></svg>
}

// ─── Navigation Configuration ─────────────────────────────────────────────

/**
 * Level 2 header tabs with their Level 3 sidebar items.
 */
const NAV_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard Guru',
    icon: <IconDashboard />,
    sidebar: [
      { id: 'buat-sesi', label: 'Buat Sesi Presensi', icon: <IconPlus /> },
    ],
  },
  {
    id: 'presensi',
    label: 'Presensi',
    icon: <IconClipboard />,
    sidebar: [
      { id: 'sesi-aktif', label: 'Lihat Sesi Aktif', icon: <IconEye /> },
      { id: 'rekap',      label: 'Rekap Presensi',   icon: <IconChart /> },
    ],
  },
]

// ─── Header ───────────────────────────────────────────────────────────────

function GuruHeader({ activeTab, onTabChange, onToggleSidebar, user }) {
  const initials = (user?.nama_lengkap || user?.username || 'G')
    .charAt(0).toUpperCase()

  return (
    <header className="guru-header" role="banner">
      <button
        type="button"
        className="guru-header-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <IconMenu />
      </button>

      <div className="guru-header-brand">
        <div className="guru-header-brand-icon" aria-hidden="true">
          <IconSchool />
        </div>
        <span className="guru-header-brand-text">Presensi Lab</span>
      </div>

      <nav className="guru-header-nav" role="navigation" aria-label="Menu utama guru">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`guru-header-nav-item${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="guru-header-user">
        <div className="guru-header-user-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="guru-header-user-info">
          <span className="guru-header-user-name">
            {user?.nama_lengkap || user?.username || 'Guru'}
          </span>
          <span className="guru-header-user-role">Guru</span>
        </div>
      </div>
    </header>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

function GuruSidebar({ collapsed, activeTab, activePage, onPageChange, onLogout, isLoggingOut }) {
  const currentTab = NAV_TABS.find((t) => t.id === activeTab)
  const sidebarItems = currentTab?.sidebar ?? []

  return (
    <aside className="guru-sidebar" aria-label="Sidebar navigasi guru">
      <div className="guru-sidebar-brand">
        <div className="guru-sidebar-brand-icon">
          <IconSchool />
        </div>
        {!collapsed && (
          <div className="guru-sidebar-brand-text">
            <strong>SMK Rajasa</strong>
            <span>Sistem Presensi</span>
          </div>
        )}
      </div>

      <nav className="guru-sidebar-nav" role="navigation" aria-label="Menu sidebar guru">
        {sidebarItems.length > 0 ? (
          <>
            {!collapsed && (
              <div className="guru-sidebar-nav-label" aria-hidden="true">Menu</div>
            )}
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`guru-sidebar-nav-item${activePage === item.id ? ' active' : ''}`}
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
          !collapsed && (
            <p className="guru-sidebar-empty">Tidak ada menu tambahan.</p>
          )
        )}
      </nav>

      <div className="guru-sidebar-footer">
        <button
          type="button"
          className="guru-sidebar-logout"
          onClick={onLogout}
          disabled={isLoggingOut}
          title={collapsed ? 'Keluar' : undefined}
          aria-label="Keluar dari sistem"
        >
          <span className="nav-icon" aria-hidden="true"><IconLogout /></span>
          {!collapsed && <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────

/**
 * GuruLayout
 *
 * Top-level layout wrapper for all teacher pages.
 * Manages active tab (Level 2) and active sidebar page (Level 3),
 * then renders the correct page via the `renderPage` render-prop.
 *
 * @param {{ user: Object, onLogout: Function, renderPage: Function }} props
 */
export default function GuruLayout({ user, onLogout, renderPage }) {
  const [activeTab,    setActiveTab]    = useState('dashboard')
  const [activePage,   setActivePage]   = useState('buat-sesi')
  const [collapsed,    setCollapsed]    = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    const tab = NAV_TABS.find((t) => t.id === tabId)
    setActivePage(tab?.sidebar[0]?.id ?? null)
  }, [])

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    } catch (err) {
      console.error('[GuruLayout] Logout error:', err)
    } finally {
      appStorage.remove(STORAGE_KEYS.AUTH_TOKEN)
      appStorage.remove(STORAGE_KEYS.AUTH_USER)
      setIsLoggingOut(false)
      if (typeof onLogout === 'function') onLogout()
    }
  }, [isLoggingOut, onLogout])

  return (
    <div className={`guru-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <GuruHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onToggleSidebar={handleToggle}
        user={user}
      />

      <GuruSidebar
        collapsed={collapsed}
        activeTab={activeTab}
        activePage={activePage}
        onPageChange={setActivePage}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="guru-content" id="main-content">
        <div className="guru-page-content">
          {typeof renderPage === 'function'
            ? renderPage(activeTab, activePage)
            : null}
        </div>
      </main>
    </div>
  )
}

/**
 * DashboardSiswa.jsx
 *
 * Main entry page for the student (siswa) role.
 * Wires together SiswaLayout (Level 2 header + Level 3 sidebar) with the
 * appropriate content component for each active tab / sidebar page.
 *
 * Content routing logic:
 *   Tab "dashboard"         + page "presensi"  → PresensiCounter   (Level 4)
 *   Tab "dashboard"         + page "kalender"  → KalenderAkademik  (Level 4)
 *   Tab "halaman-presensi"  + any page         → TablePresensi     (Level 4)
 *
 * Architecture reference: HTA-Magang-SMK-Rajasa-Siswa.png
 *
 * @module pages/siswa/DashboardSiswa
 * @author fashich/dashboard-siswa-page
 */

import SiswaLayout from '../../components/siswa/SiswaLayout'
import PresensiCounter from '../../components/siswa/PresensiCounter'
import KalenderAkademik from '../../components/siswa/KalenderAkademik'

/**
 * Placeholder content shown while individual page features are built.
 * Will be replaced by real components in subsequent commits.
 *
 * @param {{ label: string }} props
 */
function PagePlaceholder({ label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      color: '#64748b',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#e0f2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="#0284c7" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>
      <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '0.85rem' }}>
        Konten halaman ini sedang dalam pengembangan.
      </p>
    </div>
  )
}

/**
 * Resolve the content component based on the current active tab and page.
 *
 * @param {string} activeTab   - Level 2 active tab id
 * @param {string} activePage  - Level 3 active sidebar page id
 * @returns {preact.VNode}
 */
function resolveContent(activeTab, activePage) {
  if (activeTab === 'dashboard') {
    if (activePage === 'presensi') {
      // Level 4: Attendance counters — Tepat Waktu, Terlambat, Alpha, Sakit, Izin
      return <PresensiCounter />
    }
    if (activePage === 'kalender') {
      // Level 4: PDF viewer — shows academic calendar or empty state
      return <KalenderAkademik />
    }
  }

  if (activeTab === 'halaman-presensi') {
    // TODO: Replace with <TablePresensi /> in the next commit
    return <PagePlaceholder label="Tabel Presensi Siswa" />
  }

  return <PagePlaceholder label="Halaman tidak ditemukan." />
}

/**
 * DashboardSiswa
 *
 * Accepts `user` and `onLogout` props passed down from app.jsx.
 *
 * @param {{ user: Object, onLogout: Function }} props
 */
export default function DashboardSiswa({ user, onLogout }) {
  return (
    <SiswaLayout
      user={user}
      onLogout={onLogout}
      renderPage={(activeTab, activePage) => resolveContent(activeTab, activePage)}
    />
  )
}

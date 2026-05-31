/**
 * DashboardGuru.jsx
 *
 * Main entry page for the teacher (guru) role.
 * Wires GuruLayout (Level 2 + Level 3) with content components per page.
 *
 * Content routing:
 *   Tab "dashboard"  + page "buat-sesi"  → BuatSesiPresensi  (Level 4)
 *   Tab "presensi"   + page "sesi-aktif" → SesiAktif         (Level 4)
 *   Tab "presensi"   + page "rekap"      → RekapPresensi     (Level 4)
 *
 * Architecture: HTA-Guru-Magang-SMK-Rajasa-Siswa.png
 *
 * @module pages/guru/DashboardGuru
 * @author fashich/dashboard-guru-page
 */

import GuruLayout from '../../components/guru/GuruLayout'
import BuatSesiPresensi from '../../components/guru/BuatSesiPresensi'
import SesiAktif from '../../components/guru/SesiAktif'

/**
 * Temporary placeholder — replaced by real components in next commits.
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
        width: 64, height: 64,
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
 * Resolve content component based on active tab + page.
 */
function resolveContent(activeTab, activePage) {
  if (activeTab === 'dashboard' && activePage === 'buat-sesi') {
    return <BuatSesiPresensi />
  }

  if (activeTab === 'presensi') {
    if (activePage === 'sesi-aktif') {
      return <SesiAktif />
    }
    if (activePage === 'rekap') {
      // TODO: Replace with <RekapPresensi /> in next commit
      return <PagePlaceholder label="Rekap Presensi" />
    }
  }

  return null
}

/**
 * DashboardGuru
 *
 * @param {{ user: Object, onLogout: Function }} props
 */
export default function DashboardGuru({ user, onLogout }) {
  return (
    <GuruLayout
      user={user}
      onLogout={onLogout}
      renderPage={(activeTab, activePage) => resolveContent(activeTab, activePage)}
    />
  )
}

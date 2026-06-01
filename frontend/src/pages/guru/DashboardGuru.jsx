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
import RekapPresensi from '../../components/guru/RekapPresensi'

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
      return <RekapPresensi />
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

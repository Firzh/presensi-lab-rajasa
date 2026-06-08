/**
 * DashboardStaff.jsx
 *
 * Main entry page for the staff role.
 * Wires StaffLayout (Level 2 + Level 3) with content components.
 *
 * Content routing:
 *   Tab "dashboard" + page "sesi-aktif" → SesiAktifStaff  (Level 4)
 *   Tab "sesi"      + page "buat-sesi"  → BuatSesiPiket   (Level 4)
 *   Tab "sesi"      + page "rekap"      → RekapGlobal     (Level 4)
 *
 * @module pages/staff/DashboardStaff
 * @author fashich/dashboard-staff-page
 */

import StaffLayout from '../../components/staff/StaffLayout'
import SesiAktifStaff from '../../components/staff/SesiAktifStaff'
import BuatSesiPiket from '../../components/staff/BuatSesiPiket'
import RekapGlobal from '../../components/staff/RekapGlobal'

function resolveContent(activeTab, activePage) {
  if (activeTab === 'dashboard' && activePage === 'sesi-aktif') return <SesiAktifStaff />
  if (activeTab === 'sesi') {
    if (activePage === 'buat-sesi') return <BuatSesiPiket />
    if (activePage === 'rekap')     return <RekapGlobal />
  }
  return null
}

export default function DashboardStaff({ user, onLogout }) {
  return (
    <StaffLayout
      user={user}
      onLogout={onLogout}
      renderPage={(activeTab, activePage) => resolveContent(activeTab, activePage)}
    />
  )
}

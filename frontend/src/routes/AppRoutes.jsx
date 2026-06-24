import { LocationProvider, Route, Router } from 'preact-iso';

import { ROUTES } from '../constants/routes.js';
import { PrivateRoute } from '../components/auth/PrivateRoute.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { DevAttendanceAuditPage } from '../pages/dev/DevAttendanceAuditPage.jsx';
import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { SiswaPage } from '../pages/management/SiswaPage.jsx';
import { JurusanPage } from '../pages/management/JurusanPage.jsx';
import { LaporanPage } from '../pages/management/LaporanPage.jsx';
import { PresensiPage } from '../pages/management/PresensiPage.jsx';
import { PresensiScanPage } from '../pages/management/PresensiScanPage.jsx';
import { ManageUsersPage } from '../pages/management/ManageUsersPage.jsx';
import { LogUsersPage } from '../pages/management/LogUsersPage.jsx';
import { PengaturanPage } from '../pages/management/PengaturanPage.jsx';
import { DevImportPage } from '../pages/dev/DevImportPage.jsx';
import { DevScanPage } from '../pages/dev/DevScanPage.jsx';

/**
 * BUG-01 + BUG-08 fix: Semua route private kini dilindungi PrivateRoute.
 *
 * Pola yang digunakan:
 *   component={PrivateRoute} pageComponent={HalamanTarget}
 *
 * preact-iso meneruskan semua props Route ke komponen `component`.
 * PrivateRoute menerima `pageComponent` dan merendernya jika token ada.
 * Jika tidak ada token → redirect ke login via replace() (tidak masuk history).
 *
 * Route public (tidak perlu login):
 * - /  → LoginPage
 *
 * Route private (wajib login):
 * - Semua route dashboard, presensi, manajemen, admin, dan dev
 */
export function AppRoutes() {
  return (
    <LocationProvider>
      <Router>
        {/* Route public — hanya halaman login */}
        <Route path={ROUTES.LOGIN} component={LoginPage} />

        {/* Route dev — dilindungi auth (BUG-08 fix) */}
        <Route path={ROUTES.DEV_SCAN} component={PrivateRoute} pageComponent={DevScanPage} />
        <Route path={ROUTES.DEV_IMPORT} component={PrivateRoute} pageComponent={DevImportPage} />
        <Route path={ROUTES.DEV_ATTENDANCE_AUDIT} component={PrivateRoute} pageComponent={DevAttendanceAuditPage} />

        {/* Route private — semua halaman berikut wajib login (BUG-01 fix) */}
        <Route path={ROUTES.DASHBOARD} component={PrivateRoute} pageComponent={DashboardPage} />
        <Route path={ROUTES.SISWA} component={PrivateRoute} pageComponent={SiswaPage} />
        <Route path={ROUTES.JURUSAN} component={PrivateRoute} pageComponent={JurusanPage} />
        <Route path={ROUTES.PRESENSI} component={PrivateRoute} pageComponent={PresensiPage} />
        <Route path={ROUTES.PRESENSI_SCAN} component={PrivateRoute} pageComponent={PresensiScanPage} />
        <Route path={ROUTES.LAPORAN} component={PrivateRoute} pageComponent={LaporanPage} />
        <Route path={ROUTES.USERS} component={PrivateRoute} pageComponent={ManageUsersPage} />
        <Route path={ROUTES.LOG_USERS} component={PrivateRoute} pageComponent={LogUsersPage} />
        <Route path={ROUTES.PENGATURAN} component={PrivateRoute} pageComponent={PengaturanPage} />

        <Route default component={NotFoundPage} />
      </Router>
    </LocationProvider>
  );
}

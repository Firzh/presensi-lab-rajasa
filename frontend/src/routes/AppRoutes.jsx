import { LocationProvider, Route, Router } from 'preact-iso';

import { ROUTES } from '../constants/routes.js';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { DevAttendanceAuditPage } from '../pages/dev/DevAttendanceAuditPage.jsx';
import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { SiswaPage } from '../pages/management/SiswaPage.jsx';
import { JurusanPage } from '../pages/management/JurusanPage.jsx';
import { PresensiPage } from '../pages/management/PresensiPage.jsx';
import { PresensiScanPage } from '../pages/management/PresensiScanPage.jsx';
import { DevImportPage } from '../pages/dev/DevImportPage.jsx';
import { DevScanPage } from '../pages/dev/DevScanPage.jsx';

export function AppRoutes() {
  return (
    <LocationProvider>
      <Router>
        <Route path={ROUTES.LOGIN} component={LoginPage} />
        <Route path={ROUTES.DEV_SCAN} component={DevScanPage} />
        <Route path={ROUTES.DEV_IMPORT} component={DevImportPage} />
        <Route path={ROUTES.DEV_ATTENDANCE_AUDIT} component={DevAttendanceAuditPage} />
        <Route path={ROUTES.DASHBOARD} component={DashboardPage} />
        <Route path={ROUTES.SISWA} component={SiswaPage} />
        <Route path={ROUTES.JURUSAN} component={JurusanPage} />
        <Route path={ROUTES.PRESENSI} component={PresensiPage} />
        <Route path={ROUTES.PRESENSI_SCAN} component={PresensiScanPage} />
        <Route default component={NotFoundPage} />
      </Router>
    </LocationProvider>
  );
}

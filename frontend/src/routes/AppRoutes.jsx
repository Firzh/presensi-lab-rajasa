import { LocationProvider, Route, Router } from 'preact-iso';

import { HomePageDev } from '../pages/HomePageDev.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { DevAttendanceAuditPage } from '../pages/dev/DevAttendanceAuditPage.jsx';
import { DevImportPage } from '../pages/dev/DevImportPage.jsx';
import { DevScanPage } from '../pages/dev/DevScanPage.jsx';

export function AppRoutes() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={HomePageDev} />
        <Route path="/dev/scan" component={DevScanPage} />
        <Route path="/dev/import" component={DevImportPage} />
        <Route path="/dev/attendance-audit" component={DevAttendanceAuditPage} />
        <Route default component={NotFoundPage} />
      </Router>
    </LocationProvider>
  );
}
import { useState } from 'preact/hooks';
import { fetchPresensiAudit, loginDev } from '../../api/presensiScanApi.js';
import {
  AttendanceTable,
  AuditSummaryCards,
  DevAuditHeader,
  ScanLogTable,
} from '../../components/dev-audit/index.js';

export function DevAttendanceAuditPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('Siap cek audit presensi.');

  const handleLoginAndLoad = async () => {
    setStatus('Login demo...');

    const login = await loginDev({ username: 'admin.demo', password: 'Rajasa@123' });

    if (!login.ok || !login.data?.success) {
      setStatus(login.data?.message || 'Login gagal.');
      return;
    }

    setStatus('Memuat audit presensi...');

    const audit = await fetchPresensiAudit({ token: login.data.data.token });

    if (!audit.ok || !audit.data?.success) {
      setStatus(audit.data?.message || 'Gagal memuat audit.');
      return;
    }

    setData(audit.data.data);
    setStatus(audit.data.message || 'Audit presensi berhasil dimuat.');
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <DevAuditHeader status={status} onRefresh={handleLoginAndLoad} />

        {data && (
          <>
            <AuditSummaryCards summary={data.summary} />
            <ScanLogTable rows={data.scan_logs} />
            <AttendanceTable rows={data.attendance_rows} />
          </>
        )}
      </div>
    </main>
  );
}
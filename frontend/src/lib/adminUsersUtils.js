export const ADMIN_USER_FILTER_OPTIONS = Object.freeze([
  { value: '', label: 'Pilih Filter' },
  { value: 'role:admin', label: 'Role Admin' },
  { value: 'role:operator', label: 'Role Operator' },
  { value: 'role:siswa', label: 'Role Siswa' },
  { value: 'status:aktif', label: 'Status Aktif' },
  { value: 'status:nonaktif', label: 'Status Nonaktif' },
]);

export const LOG_USER_FILTER_OPTIONS = Object.freeze([
  { value: '', label: 'Pilih Filter' },
  { value: 'action:login', label: 'Action Login' },
  { value: 'action:update', label: 'Action Update' },
  { value: 'action:delete', label: 'Action Delete' },
  { value: 'status:active', label: 'Status Active' },
  { value: 'status:failed', label: 'Status Failed' },
]);

export const USER_ROLE_OPTIONS = Object.freeze([
  { value: 'Admin', label: 'Admin' },
  { value: 'Operator', label: 'Operator' },
  { value: 'Siswa', label: 'Siswa' },
]);

export const USER_TYPE_OPTIONS = Object.freeze([
  { value: 'Admin', label: 'Admin' },
  { value: 'Operator', label: 'Operator' },
  { value: 'Siswa', label: 'Siswa' },
]);

export const USER_JURUSAN_OPTIONS = Object.freeze([
  { value: 'TKJ', label: 'TKJ' },
  { value: 'RPL', label: 'RPL' },
  { value: 'MM', label: 'MM' },
  { value: 'OTKP', label: 'OTKP' },
]);

export const USER_STATUS_OPTIONS = Object.freeze([
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Nonaktif', label: 'Nonaktif' },
]);

export const mockUsers = Object.freeze([
  {
    id: 1,
    username: '0068234587',
    nama_lengkap: 'RACHMAD HIDAYAT',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'TKJ',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: 'Akun siswa aktif.',
  },
  {
    id: 2,
    username: '0068234588',
    nama_lengkap: 'NADIA PUTRI',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'RPL',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '09/06/26 07:15',
    catatan: 'Login melalui presensi lab.',
  },
  {
    id: 3,
    username: 'OPR001',
    nama_lengkap: 'ADMINISTRATOR UTAMA',
    role: 'Admin',
    tipe_user: 'Operator',
    jurusan: '-',
    status: 'Aktif',
    valid_hingga: '31/12/26',
    login_terakhir: '09/06/26 08:10',
    catatan: 'Akun operator utama.',
  },
  {
    id: 4,
    username: '0068234589',
    nama_lengkap: 'BIMA SAPUTRA',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'MM',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: '',
  },
  {
    id: 5,
    username: '0068234590',
    nama_lengkap: 'SITI AMALIA',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'TKJ',
    status: 'Nonaktif',
    valid_hingga: '26/06/26',
    login_terakhir: '07/06/26 09:30',
    catatan: 'Akun dinonaktifkan sementara.',
  },
  {
    id: 6,
    username: 'OPR002',
    nama_lengkap: 'PETUGAS LAB',
    role: 'Operator',
    tipe_user: 'Operator',
    jurusan: '-',
    status: 'Aktif',
    valid_hingga: '31/12/26',
    login_terakhir: '08/06/26 12:00',
    catatan: 'Akun petugas lab.',
  },
  {
    id: 7,
    username: '0068234591',
    nama_lengkap: 'RIZKY RAMADHAN',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'RPL',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: '',
  },
  {
    id: 8,
    username: '0068234592',
    nama_lengkap: 'DEWI LESTARI',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'OTKP',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '06/06/26 10:42',
    catatan: '',
  },
  {
    id: 9,
    username: '0068234593',
    nama_lengkap: 'AGUS SETIAWAN',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'TKJ',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: '',
  },
  {
    id: 10,
    username: '0068234594',
    nama_lengkap: 'MAYA KURNIA',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'RPL',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: '',
  },
  {
    id: 11,
    username: '0068234595',
    nama_lengkap: 'FAJAR PRATAMA',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'MM',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: '',
  },
  {
    id: 12,
    username: '0068234596',
    nama_lengkap: 'LAILA MAHARANI',
    role: 'Siswa',
    tipe_user: 'Siswa',
    jurusan: 'TKJ',
    status: 'Aktif',
    valid_hingga: '26/06/26',
    login_terakhir: '-',
    catatan: '',
  },
]);

export const mockLogUsers = Object.freeze([
  {
    id: 1,
    username: '0068234587',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 07:12',
    ip_address: '192.168.10.21',
    details: 'User berhasil login ke halaman presensi siswa.',
  },
  {
    id: 2,
    username: 'OPR001',
    role: 'Admin',
    action_type: 'Update',
    module: 'manage-users',
    status: 'Active',
    waktu: '09/06/26 07:30',
    ip_address: '192.168.10.10',
    details: 'Admin memperbarui masa berlaku akun siswa.',
  },
  {
    id: 3,
    username: '0068234588',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 07:35',
    ip_address: '192.168.10.22',
    details: 'User berhasil login menggunakan perangkat lab.',
  },
  {
    id: 4,
    username: '0068234590',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Failed',
    waktu: '09/06/26 08:05',
    ip_address: '192.168.10.25',
    details: 'Login gagal karena akun nonaktif.',
  },
  {
    id: 5,
    username: 'OPR002',
    role: 'Operator',
    action_type: 'Login',
    module: 'dashboard',
    status: 'Active',
    waktu: '09/06/26 08:16',
    ip_address: '192.168.10.11',
    details: 'Operator berhasil login ke dashboard.',
  },
  {
    id: 6,
    username: '0068234591',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 08:25',
    ip_address: '192.168.10.26',
    details: 'User berhasil login ke halaman presensi siswa.',
  },
  {
    id: 7,
    username: '0068234592',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 08:33',
    ip_address: '192.168.10.27',
    details: 'User berhasil login ke halaman presensi siswa.',
  },
  {
    id: 8,
    username: 'OPR001',
    role: 'Admin',
    action_type: 'Delete',
    module: 'manage-users',
    status: 'Active',
    waktu: '09/06/26 08:40',
    ip_address: '192.168.10.10',
    details: 'Admin menonaktifkan akun user lama.',
  },
  {
    id: 9,
    username: '0068234593',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 08:51',
    ip_address: '192.168.10.28',
    details: 'User berhasil login ke halaman presensi siswa.',
  },
  {
    id: 10,
    username: '0068234594',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 09:01',
    ip_address: '192.168.10.29',
    details: 'User berhasil login ke halaman presensi siswa.',
  },
  {
    id: 11,
    username: '0068234595',
    role: 'Siswa',
    action_type: 'Update',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 09:15',
    ip_address: '192.168.10.30',
    details: 'User memperbarui profil dasar.',
  },
  {
    id: 12,
    username: '0068234596',
    role: 'Siswa',
    action_type: 'Login',
    module: 'student-page',
    status: 'Active',
    waktu: '09/06/26 09:22',
    ip_address: '192.168.10.31',
    details: 'User berhasil login ke halaman presensi siswa.',
  },
]);

export function getVisiblePages(currentPage, totalPages) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const startPage = Math.max(1, safeCurrentPage - 1);
  const endPage = Math.min(safeTotalPages, safeCurrentPage + 2);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

export function paginateRows(rows, page = 1, perPage = 10) {
  const safePerPage = Math.max(1, perPage);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * safePerPage;

  return {
    items: rows.slice(startIndex, startIndex + safePerPage),
    pagination: {
      page: safePage,
      per_page: safePerPage,
      total,
      total_pages: totalPages,
    },
  };
}

export function filterUsers(users, filters = {}) {
  const keyword = String(filters.keyword ?? '').trim().toLowerCase();
  const [filterKey, filterValue] = String(filters.filter ?? '').split(':');

  return users.filter((user) => {
    const searchableText = [
      user.username,
      user.nama_lengkap,
      user.role,
      user.tipe_user,
      user.jurusan,
      user.status,
    ]
      .join(' ')
      .toLowerCase();

    const keywordMatch = !keyword || searchableText.includes(keyword);
    const filterMatch = !filterValue
      || (filterKey === 'role' && user.role.toLowerCase() === filterValue)
      || (filterKey === 'status' && user.status.toLowerCase() === filterValue);

    return keywordMatch && filterMatch;
  });
}

export function filterLogUsers(logs, filters = {}) {
  const keyword = String(filters.keyword ?? '').trim().toLowerCase();
  const [filterKey, filterValue] = String(filters.filter ?? '').split(':');

  return logs.filter((log) => {
    const searchableText = [
      log.username,
      log.role,
      log.action_type,
      log.module,
      log.status,
      log.details,
    ]
      .join(' ')
      .toLowerCase();

    const keywordMatch = !keyword || searchableText.includes(keyword);
    const filterMatch = !filterValue
      || (filterKey === 'action' && log.action_type.toLowerCase() === filterValue)
      || (filterKey === 'status' && log.status.toLowerCase() === filterValue);

    return keywordMatch && filterMatch;
  });
}

export function normalizeDateForInput(value) {
  if (!value || value === '-') {
    return '';
  }

  const [day, month, year] = String(value).split('/');

  if (!day || !month || !year) {
    return '';
  }

  return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function formatDateFromInput(value) {
  if (!value) {
    return '-';
  }

  const [year, month, day] = value.split('-');

  return `${day}/${month}/${year.slice(-2)}`;
}

export function buildLogsCsv(rows) {
  const headers = ['Username', 'Role', 'Action Type', 'Module', 'Status', 'Waktu', 'IP Address', 'Details'];
  const body = rows.map((row) => [
    row.username,
    row.role,
    row.action_type,
    row.module,
    row.status,
    row.waktu,
    row.ip_address,
    row.details,
  ]);

  return [headers, ...body]
    .map((columns) => columns.map((column) => `"${String(column ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
}

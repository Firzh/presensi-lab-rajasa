const STORAGE_PREFIX = 'presensi_lab_rajasa';

export const STORAGE_KEYS = Object.freeze({
  SESSION: `${STORAGE_PREFIX}:session`,
  AUTH_TOKEN: `${STORAGE_PREFIX}:auth_token`,
  AUTH_USER: `${STORAGE_PREFIX}:auth_user`,
  AUTH_ROLES: `${STORAGE_PREFIX}:auth_roles`,
  AUTH_PERMISSIONS: `${STORAGE_PREFIX}:auth_permissions`,
  THEME: `${STORAGE_PREFIX}:theme`,
  SISWA_LIST: `${STORAGE_PREFIX}:siswa_list`,
  JURUSAN_LIST: `${STORAGE_PREFIX}:jurusan_list`,
  RUANGAN_LIST: `${STORAGE_PREFIX}:ruangan_list`,
});
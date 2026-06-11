export const settingTabs = Object.freeze([
  {
    key: 'backup',
    icon: 'shieldHalved',
    title: 'Backup Database',
    description: 'Amankan data dan unduh riwayat backup.',
  },
  {
    key: 'jadwal',
    icon: 'calendar',
    title: 'Jam Pelajaran Rombel',
    description: 'Atur jam rombel, slot mapel, dan istirahat.',
  },
  {
    key: 'keterlambatan',
    icon: 'clock',
    title: 'Aturan Keterlambatan',
    description: 'Tentukan jam masuk dan toleransi presensi.',
  },
]);

export const scheduleDayOptions = Object.freeze([
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]);

export const rombelMajorOptions = Object.freeze([
  { value: 'all', label: 'Semua Jurusan' },
  { value: 'TKJ', label: 'TKJ' },
  { value: 'AKL', label: 'AKL' },
  { value: 'RPL', label: 'RPL' },
]);

export const rombelYearOptions = Object.freeze([
  { value: 'all', label: 'Semua Angkatan' },
  { value: '1', label: 'Tahun ke-1 / X' },
  { value: '2', label: 'Tahun ke-2 / XI' },
  { value: '3', label: 'Tahun ke-3 / XII' },
]);

export const rombelSettingOptions = Object.freeze([]);

export function filterRombelOptions(options, jurusanFilter = 'all', yearFilter = 'all') {
  return options.filter((rombel) => {
    const matchesMajor = jurusanFilter === 'all' || rombel.jurusan === jurusanFilter;
    const matchesYear = yearFilter === 'all' || rombel.year === yearFilter;

    return matchesMajor && matchesYear;
  });
}

export function getDefaultBatchRombelIds() {
  return rombelSettingOptions.map((rombel) => rombel.id);
}

/**
 * BUG-10 fix: mockBackupHistory dikosongkan.
 * Data palsu sebelumnya menyesatkan user karena tampil sebelum data backend dimuat,
 * dan tetap tampil jika backend gagal. Sekarang PengaturanPage memulai dengan array
 * kosong sehingga tidak ada data palsu yang ditampilkan.
 */
export const mockBackupHistory = Object.freeze([]);

export const defaultLateRule = Object.freeze({
  standardTime: '07:00',
  toleranceMinutes: 10,
  autoStatus: true,
  note: 'Lewat dari batas toleransi otomatis dihitung Terlambat.',
});

function pad(value) {
  return String(value).padStart(2, '0');
}

export function addMinutesToTime(time, minutes) {
  const [hour = '0', minute = '0'] = String(time).split(':');
  const totalMinutes = Number(hour) * 60 + Number(minute) + Number(minutes || 0);
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;

  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

export function createBackupRecord(history = []) {
  const now = new Date();
  const safeDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const safeTime = `${pad(now.getHours())}${pad(now.getMinutes())}`;

  return {
    id: `bck-${Date.now()}`,
    fileName: `presensi_backup_${safeDate}_${safeTime}.sql`,
    createdAt: now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    size: `${(24 + history.length * 0.4).toFixed(1)} MB`,
    status: 'Berhasil',
    by: 'Administrator Utama',
  };
}

export function buildBackupDownloadText(item) {
  return [
    'SMK Rajasa Surabaya - Backup Database',
    `File: ${item.fileName}`,
    `Waktu: ${item.createdAt}`,
    `Ukuran: ${item.size}`,
    `Status: ${item.status}`,
    `Operator: ${item.by}`,
  ].join('\n');
}

export function getDefaultScheduleSlots() {
  return renumberScheduleSlots([
    { id: 'mapel-1', type: 'mapel', duration: 40, active: true },
    { id: 'mapel-2', type: 'mapel', duration: 40, active: true },
    { id: 'mapel-3', type: 'mapel', duration: 40, active: true },
    { id: 'break-1', type: 'break', duration: 20, active: true },
    { id: 'mapel-4', type: 'mapel', duration: 40, active: true },
    { id: 'mapel-5', type: 'mapel', duration: 40, active: true },
    { id: 'mapel-6', type: 'mapel', duration: 40, active: true },
  ]);
}

function isGeneratedMapelLabel(label) {
  return /^Mapel\s+\d+$/i.test(String(label || '').trim());
}

function getSlotCustomLabel(slot) {
  const hasExplicitLabel =
    slot.customLabel !== undefined ||
    slot.custom_label !== undefined ||
    slot.subjectName !== undefined ||
    slot.subject_name !== undefined;

  if (hasExplicitLabel) {
    const explicitLabel = slot.customLabel ?? slot.custom_label ?? slot.subjectName ?? slot.subject_name ?? '';
    return String(explicitLabel || '').trim();
  }

  if (slot.type === 'mapel' && slot.label && !isGeneratedMapelLabel(slot.label)) {
    return String(slot.label).trim();
  }

  return '';
}

export function renumberScheduleSlots(slots) {
  let mapelIndex = 0;
  let breakIndex = 0;

  return slots.map((slot) => {
    if (slot.type === 'break') {
      breakIndex += 1;

      return {
        ...slot,
        label: `Istirahat ${breakIndex}`,
      };
    }

    mapelIndex += 1;
    const customLabel = getSlotCustomLabel(slot);

    return {
      ...slot,
      customLabel,
      label: customLabel || `Mapel ${mapelIndex}`,
    };
  });
}

export function countSlotsByType(slots, type) {
  return slots.filter((slot) => slot.type === type).length;
}

export function createScheduleSlot(type = 'mapel') {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    duration: type === 'break' ? 20 : 40,
    active: true,
    customLabel: '',
  };
}

export function moveScheduleSlot(slots, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return slots;
  }

  const nextSlots = [...slots];
  const [movedSlot] = nextSlots.splice(fromIndex, 1);
  nextSlots.splice(toIndex, 0, movedSlot);

  return renumberScheduleSlots(nextSlots);
}

export function calculateScheduleRows(slots, startTime) {
  let cursor = startTime;

  return slots.map((slot) => {
    const startsAt = cursor;
    const endsAt = addMinutesToTime(cursor, Number(slot.duration || 0));
    cursor = endsAt;

    return {
      ...slot,
      startsAt,
      endsAt,
    };
  });
}

export function validateScheduleRows(rows) {
  const invalidSlot = rows.find((slot) => Number(slot.duration) <= 0);

  if (invalidSlot) {
    return `${invalidSlot.label} harus memiliki durasi lebih dari 0 menit.`;
  }

  return '';
}

export function calculateLateThreshold(standardTime, toleranceMinutes) {
  return addMinutesToTime(standardTime, Number(toleranceMinutes || 0));
}
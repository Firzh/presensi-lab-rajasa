import { useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { LAPORAN_VALIDASI_OPTIONS } from '../../../lib/laporanUtils.js';
import { AppSelect } from '../../ui/AppSelect.jsx';

export function LaporanValidasiModal({ rows, theme = 'light', onClose, onSave }) {
  const isDark = theme === 'dark';
  const [selectedId, setSelectedId] = useState(rows[0]?.id ? String(rows[0].id) : '');
  const selectedRow = useMemo(() => {
    return rows.find((row) => String(row.id) === selectedId) || null;
  }, [rows, selectedId]);

  const [validasi, setValidasi] = useState(selectedRow?.validasi || 'perlu dicek');

  function handleSelectedRowChange(value) {
    const nextRow = rows.find((row) => String(row.id) === value) || null;

    setSelectedId(value);
    setValidasi(nextRow?.validasi || 'perlu dicek');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedRow) {
      return;
    }

    onSave({
      rowId: selectedRow.id,
      presensiId: selectedRow.presensi_id,
      validasi,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 px-4 py-6 sm:px-5">
      <section
        className={clsx(
          'w-full max-w-2xl rounded-2xl p-5 shadow-2xl sm:p-8',
          isDark ? 'bg-[#313b45]' : 'bg-white'
        )}
      >
        <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              className={clsx(
                'm-0 text-2xl font-extrabold',
                isDark ? 'text-[#F0EDE4]' : 'text-[#43505a]'
              )}
            >
              Edit Validasi
            </h2>
            <p className="m-0 mt-2 text-sm font-bold text-[#8b9298]">
              Pilih data presensi, lalu ubah status validasi.
            </p>
          </div>

          <button
            type="button"
            className="h-10 w-full rounded-xl bg-[#e9e9e9] px-4 font-bold text-[#43505a] transition hover:bg-[#d8dee5] sm:w-auto"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Data Presensi
            <AppSelect
              aria-label="Data Presensi"
              icon="userGraduate"
              theme={theme}
              value={selectedId}
              onInput={(event) => handleSelectedRowChange(event.currentTarget.value)}
            >
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.siswa} - {row.nisn} - {row.tanggal}
                </option>
              ))}
            </AppSelect>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Validasi
            <AppSelect
              aria-label="Validasi"
              icon="circleCheck"
              theme={theme}
              value={validasi}
              onInput={(event) => setValidasi(event.currentTarget.value)}
            >
              {LAPORAN_VALIDASI_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </AppSelect>
          </label>

          {selectedRow ? (
            <section
              className={clsx(
                'rounded-xl p-4 text-sm font-bold',
                isDark ? 'bg-[#1d262e] text-[#cfd8e3]' : 'bg-[#eef1f5] text-[#6f7882]'
              )}
            >
              <p className="m-0">Siswa: {selectedRow.siswa}</p>
              <p className="m-0 mt-2">Rombel: {selectedRow.rombel}</p>
              <p className="m-0 mt-2">Status: {selectedRow.status}</p>
              <p className="m-0 mt-2">Validasi saat ini: {selectedRow.validasi}</p>
            </section>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="h-11 w-full rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#43505a] transition hover:bg-[#d8dee5] sm:w-auto"
              onClick={onClose}
            >
              Batal
            </button>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#a9c9f4] px-5 font-bold text-[#2f5278] transition hover:bg-[#4f8fe7] hover:text-white sm:w-auto"
            >
              Simpan Validasi
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

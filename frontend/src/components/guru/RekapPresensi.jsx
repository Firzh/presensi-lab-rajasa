/**
 * RekapPresensi.jsx
 *
 * Displays attendance recap for a selected date and rombel.
 * Shown on: Presensi → Rekap Presensi (Level 4).
 *
 * Features (Level 5 per HTA):
 *   - Filter Rekap: By Tanggal (date picker), By Rombel (dropdown)
 *   - Export PDF / Download PDF → opens printable PDF via backend
 *
 * API:
 *   GET /api/presensi/jam-siswa?tanggal=&rombel_id=
 *   GET /api/rombel/options
 *
 * @module components/guru/RekapPresensi
 * @author fashich/dashboard-guru-page
 */

import { useState, useEffect, useCallback, useRef } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import './RekapPresensi.css'

// ─── API helper ─────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconDownload() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z"/></svg>
}

function IconEmpty() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.98 16.02 1 13.64 1c-1.3 0-2.43.56-3.24 1.44L9 4 7.6 2.44C6.79 1.56 5.66 1 4.36 1 1.98 1 0 2.98 0 5.36 0 5.84.11 6.28.18 6.72H0l2 14h20l2-14h-4zm-2 12H6L4.23 8h15.54L18 18z"/></svg>
}

function IconError() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
}

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABELS = {
  hadir:     'Hadir',
  terlambat: 'Terlambat',
  alpha:     'Alpha',
  sakit:     'Sakit',
  izin:      'Izin',
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ─── Summary counters ────────────────────────────────────────────────────────

function SummaryCards({ rows }) {
  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1
    return acc
  }, {})

  const items = [
    { key: 'hadir',     label: 'Hadir'     },
    { key: 'terlambat', label: 'Terlambat' },
    { key: 'alpha',     label: 'Alpha'     },
    { key: 'sakit',     label: 'Sakit'     },
    { key: 'izin',      label: 'Izin'      },
  ]

  return (
    <div className="rekap-summary" role="list" aria-label="Ringkasan presensi">
      {items.map((item) => (
        <div key={item.key} className={`rekap-summary-card ${item.key}`} role="listitem">
          <span className="rekap-summary-value">{counts[item.key] ?? 0}</span>
          <span className="rekap-summary-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * RekapPresensi
 *
 * @returns {preact.VNode}
 */
export default function RekapPresensi() {
  // Filter state
  const [tanggal,   setTanggal]   = useState(todayDate())
  const [rombelId,  setRombelId]  = useState('')

  // Applied filter (only updates on click "Tampilkan")
  const appliedFilter = useRef({ tanggal: todayDate(), rombelId: '' })

  // Rombel list
  const [rombelList,    setRombelList]    = useState([])
  const [loadingRombel, setLoadingRombel] = useState(false)

  // Rekap data
  const [rows,      setRows]      = useState([])
  const [isLoading, setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  // ── Fetch rombel options ──
  useEffect(() => {
    const fetchRombel = async () => {
      setLoadingRombel(true)
      try {
        const res = await fetch('/api/rombel/options', { headers: getAuthHeaders() })
        const data = await res.json()
        setRombelList(data.data?.rombel ?? [])
      } catch { /* ignore */ } finally {
        setLoadingRombel(false)
      }
    }
    fetchRombel()
  }, [])

  // ── Fetch rekap data ──
  const fetchRekap = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { tanggal: t, rombelId: r } = appliedFilter.current

    try {
      const params = new URLSearchParams({ tanggal: t })
      if (r) params.set('rombel_id', r)

      const res = await fetch(`/api/presensi/jam-siswa?${params}`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat rekap.')
      setRows(data.data?.attendance ?? data.data ?? [])
      setHasFetched(true)
    } catch (err) {
      console.error('[RekapPresensi] Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRekap()
  }, [fetchRekap])

  // ── Apply filter ──
  const handleApply = useCallback(() => {
    appliedFilter.current = { tanggal, rombelId }
    fetchRekap()
  }, [tanggal, rombelId, fetchRekap])

  // ── Export PDF (Level 5) ──
  // Opens the rekap URL in a new tab — browser handles print/save as PDF
  const handleExportPDF = useCallback(() => {
    const { tanggal: t, rombelId: r } = appliedFilter.current
    const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
    const params = new URLSearchParams({ tanggal: t, format: 'pdf' })
    if (r) params.set('rombel_id', r)
    if (token) params.set('token', token)
    window.open(`/api/presensi/jam-siswa/export?${params}`, '_blank')
  }, [])

  return (
    <section className="rekap-section" aria-label="Rekap Presensi">
      <header>
        <h2 className="rekap-title">Rekap Presensi</h2>
        <p className="rekap-subtitle">
          Lihat dan export rekap kehadiran siswa berdasarkan tanggal dan rombel.
        </p>
      </header>

      {/* ── Filter bar (Level 5: By Tanggal, By Rombel) ── */}
      <div className="rekap-filter-bar" role="search" aria-label="Filter rekap">
        {/* By Tanggal */}
        <div className="rekap-filter-field">
          <label htmlFor="rekap-tanggal" className="rekap-filter-label">
            Tanggal
          </label>
          <input
            id="rekap-tanggal"
            type="date"
            className="rekap-filter-input"
            value={tanggal}
            max={todayDate()}
            onChange={(e) => setTanggal(e.currentTarget.value)}
          />
        </div>

        {/* By Rombel */}
        <div className="rekap-filter-field">
          <label htmlFor="rekap-rombel" className="rekap-filter-label">
            Rombel
          </label>
          <select
            id="rekap-rombel"
            className="rekap-filter-select"
            value={rombelId}
            onChange={(e) => setRombelId(e.currentTarget.value)}
            disabled={loadingRombel}
          >
            <option value="">Semua Rombel</option>
            {rombelList.map((r) => (
              <option key={r.rombel_id} value={r.rombel_id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="rekap-filter-actions">
          <button
            type="button"
            className="rekap-apply-btn"
            onClick={handleApply}
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Tampilkan'}
          </button>

          {/* Export PDF (Level 5: Download PDF) */}
          <button
            type="button"
            className="rekap-export-btn"
            onClick={handleExportPDF}
            disabled={!hasFetched || rows.length === 0}
            aria-label="Export rekap presensi ke PDF"
            title="Download PDF"
          >
            <IconDownload />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Summary counters ── */}
      {!isLoading && !error && hasFetched && rows.length > 0 && (
        <SummaryCards rows={rows} />
      )}

      {/* ── Table card ── */}
      <div className="rekap-table-card">
        <div className="rekap-table-wrap">
          <table className="rekap-table" aria-label="Tabel rekap presensi">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">NISN</th>
                <th scope="col">Nama Siswa</th>
                <th scope="col">Kelas</th>
                <th scope="col">Jam</th>
                <th scope="col">Status</th>
                <th scope="col">Mode</th>
                <th scope="col">Waktu Scan</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {isLoading && (
                <tr>
                  <td colSpan={8}>
                    <div className="rekap-state">
                      <div className="rekap-state-spinner" aria-hidden="true" />
                      <p className="rekap-state-desc">Memuat data rekap...</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}
              {!isLoading && error && (
                <tr>
                  <td colSpan={8}>
                    <div className="rekap-state">
                      <div className="rekap-state-icon is-error" aria-hidden="true">
                        <IconError />
                      </div>
                      <p className="rekap-state-title">Gagal Memuat Data</p>
                      <p className="rekap-state-desc">{error}</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading && !error && hasFetched && rows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="rekap-state">
                      <div className="rekap-state-icon" aria-hidden="true">
                        <IconEmpty />
                      </div>
                      <p className="rekap-state-title">Tidak Ada Data</p>
                      <p className="rekap-state-desc">
                        Tidak ada data presensi untuk filter yang dipilih.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!isLoading && !error && rows.map((row, idx) => (
                <tr key={row.presensi_id ?? idx}>
                  <td>{idx + 1}</td>
                  <td>{row.nisn ?? '—'}</td>
                  <td style={{ fontWeight: 500 }}>{row.nama_lengkap ?? '—'}</td>
                  <td>{row.kelas_aktif ?? '—'}</td>
                  <td>Jam {row.jam_id ?? '—'}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {row.mode_presensi ?? '—'}
                  </td>
                  <td>
                    {row.scanned_at
                      ? new Date(row.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

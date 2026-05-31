/**
 * BuatSesiPresensi.jsx
 *
 * Form for creating a new attendance session (presensi sesi).
 * Shown on: Dashboard Guru → Buat Sesi Presensi (Level 4).
 *
 * Features (Level 5 per HTA):
 *   - Mode toggle: Mode Rombel / Mode Piket
 *   - Pilih Rombel: dropdown (only shown on mode rombel)
 *   - Pilih Jam: checkbox grid Jam 1–8
 *   - Submit Sesi button
 *
 * API calls:
 *   GET  /api/rombel/options  → fetch active rombel list
 *   POST /api/presensi/sesi   → create session
 *
 * Request body:
 *   { mode_presensi: 'rombel'|'piket', rombel_id?: number, jam_ids: number[] }
 *
 * @module components/guru/BuatSesiPresensi
 * @author fashich/dashboard-guru-page
 */

import { useState, useEffect, useCallback } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import './BuatSesiPresensi.css'

// ─── API helper ────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ─── Jam configuration ─────────────────────────────────────────────────────

/**
 * Jam Pembelajaran 1–8.
 * Label and approximate times shown to user.
 */
const JAM_LIST = [
  { jam_id: 1, label: 'Jam 1', time: '07:00' },
  { jam_id: 2, label: 'Jam 2', time: '07:45' },
  { jam_id: 3, label: 'Jam 3', time: '08:30' },
  { jam_id: 4, label: 'Jam 4', time: '09:15' },
  { jam_id: 5, label: 'Jam 5', time: '10:15' },
  { jam_id: 6, label: 'Jam 6', time: '11:00' },
  { jam_id: 7, label: 'Jam 7', time: '11:45' },
  { jam_id: 8, label: 'Jam 8', time: '12:30' },
]

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function IconRombel() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  )
}

function IconPiket() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  )
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

/**
 * BuatSesiPresensi
 *
 * @param {{ onSessionCreated?: Function }} props
 */
export default function BuatSesiPresensi({ onSessionCreated }) {
  // Form state
  const [mode,       setMode]       = useState('rombel')   // 'rombel' | 'piket'
  const [rombelId,   setRombelId]   = useState('')
  const [selectedJam, setSelectedJam] = useState([])       // array of jam_id numbers

  // Rombel list from API
  const [rombelList,    setRombelList]    = useState([])
  const [loadingRombel, setLoadingRombel] = useState(false)
  const [rombelError,   setRombelError]   = useState(null)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError,  setSubmitError]  = useState(null)
  const [createdSesi,  setCreatedSesi]  = useState(null)   // session created successfully

  // ── Fetch rombel options ──
  const fetchRombel = useCallback(async () => {
    setLoadingRombel(true)
    setRombelError(null)
    try {
      const res = await fetch('/api/rombel/options', {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat rombel.')
      setRombelList(data.data?.rombel ?? [])
    } catch (err) {
      console.error('[BuatSesiPresensi] Fetch rombel error:', err)
      setRombelError(err.message)
    } finally {
      setLoadingRombel(false)
    }
  }, [])

  useEffect(() => {
    fetchRombel()
  }, [])

  // ── Jam toggle ──
  const toggleJam = useCallback((jamId) => {
    setSelectedJam((prev) =>
      prev.includes(jamId)
        ? prev.filter((id) => id !== jamId)
        : [...prev, jamId].sort((a, b) => a - b)
    )
  }, [])

  // ── Reset form ──
  const resetForm = useCallback(() => {
    setMode('rombel')
    setRombelId('')
    setSelectedJam([])
    setSubmitError(null)
    setCreatedSesi(null)
  }, [])

  // ── Submit ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSubmitError(null)

    // Validation
    if (selectedJam.length === 0) {
      setSubmitError('Pilih minimal 1 jam pembelajaran.')
      return
    }
    if (mode === 'rombel' && !rombelId) {
      setSubmitError('Pilih rombel terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    try {
      const body = {
        mode_presensi: mode,
        jam_ids: selectedJam,
        ...(mode === 'rombel' ? { rombel_id: parseInt(rombelId, 10) } : {}),
      }

      const res = await fetch('/api/presensi/sesi', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal membuat sesi.')

      setCreatedSesi(data.data)
      if (typeof onSessionCreated === 'function') onSessionCreated(data.data)
    } catch (err) {
      console.error('[BuatSesiPresensi] Submit error:', err)
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [mode, rombelId, selectedJam, onSessionCreated])

  // ── Success state ──
  if (createdSesi) {
    return (
      <section className="buat-sesi-section" aria-label="Sesi Presensi Berhasil Dibuat">
        <header>
          <h2 className="buat-sesi-title">Buat Sesi Presensi</h2>
        </header>

        <div className="buat-sesi-card">
          <div className="buat-sesi-success">
            <div className="buat-sesi-success-icon" aria-hidden="true">
              <IconCheck />
            </div>
            <h3>Sesi Berhasil Dibuat!</h3>
            <p>
              Sesi presensi mode <strong>{mode === 'rombel' ? 'Rombel' : 'Piket'}</strong> sudah aktif.
              Siswa dapat melakukan absensi sekarang.
            </p>
            <div className="buat-sesi-success-actions">
              <button type="button" className="btn-outline" onClick={resetForm}>
                Buat Sesi Baru
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="buat-sesi-section" aria-label="Buat Sesi Presensi">
      <header>
        <h2 className="buat-sesi-title">Buat Sesi Presensi</h2>
        <p className="buat-sesi-subtitle">
          Pilih mode, rombel, dan jam untuk memulai sesi presensi.
        </p>
      </header>

      <form className="buat-sesi-card" onSubmit={handleSubmit} noValidate>

        {/* ── Level 5: Mode toggle ── */}
        <div className="form-field">
          <span className="form-label">Mode Presensi</span>
          <div className="mode-toggle-group" role="group" aria-label="Pilih mode presensi">
            <button
              type="button"
              className={`mode-toggle-btn${mode === 'rombel' ? ' active' : ''}`}
              onClick={() => setMode('rombel')}
              aria-pressed={mode === 'rombel'}
            >
              <span className="mode-icon" aria-hidden="true"><IconRombel /></span>
              Mode Rombel
            </button>
            <button
              type="button"
              className={`mode-toggle-btn${mode === 'piket' ? ' active' : ''}`}
              onClick={() => setMode('piket')}
              aria-pressed={mode === 'piket'}
            >
              <span className="mode-icon" aria-hidden="true"><IconPiket /></span>
              Mode Piket
            </button>
          </div>
        </div>

        {/* ── Level 5: Pilih Rombel (only on mode rombel) ── */}
        {mode === 'rombel' && (
          <div className="form-field">
            <label htmlFor="rombel-select" className="form-label">
              Pilih Rombel <span style={{ color: '#ef4444' }}>*</span>
            </label>
            {loadingRombel ? (
              <div className="skeleton-select" aria-busy="true" aria-label="Memuat daftar rombel" />
            ) : rombelError ? (
              <div className="buat-sesi-alert is-error">
                <IconAlert />
                <span>{rombelError}</span>
              </div>
            ) : (
              <select
                id="rombel-select"
                className="form-select"
                value={rombelId}
                onChange={(e) => setRombelId(e.currentTarget.value)}
                required
              >
                <option value="">— Pilih Rombel —</option>
                {rombelList.map((r) => (
                  <option key={r.rombel_id} value={r.rombel_id}>
                    {r.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* ── Level 5: Pilih Jam 1–8 ── */}
        <div className="form-field">
          <span className="form-label">
            Pilih Jam Pembelajaran <span style={{ color: '#ef4444' }}>*</span>
          </span>
          <div className="jam-grid" role="group" aria-label="Pilih jam pembelajaran">
            {JAM_LIST.map((jam) => (
              <div key={jam.jam_id} className="jam-checkbox-item">
                <input
                  type="checkbox"
                  id={`jam-${jam.jam_id}`}
                  className="jam-checkbox-input"
                  checked={selectedJam.includes(jam.jam_id)}
                  onChange={() => toggleJam(jam.jam_id)}
                />
                <label htmlFor={`jam-${jam.jam_id}`} className="jam-checkbox-label">
                  {jam.label}
                  <span className="jam-time">{jam.time}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Error alert ── */}
        {submitError && (
          <div className="buat-sesi-alert is-error" role="alert">
            <IconAlert />
            <span>{submitError}</span>
          </div>
        )}

        {/* ── Submit button ── */}
        <button
          type="submit"
          className="buat-sesi-submit-btn"
          disabled={isSubmitting}
          aria-label="Buat sesi presensi"
        >
          {isSubmitting ? (
            <>
              <span>Membuat Sesi...</span>
            </>
          ) : (
            <>
              <IconSend />
              <span>Buat Sesi Presensi</span>
            </>
          )}
        </button>
      </form>
    </section>
  )
}

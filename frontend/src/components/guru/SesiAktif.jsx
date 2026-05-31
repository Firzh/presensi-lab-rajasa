/**
 * SesiAktif.jsx
 *
 * Displays active attendance sessions for the logged-in guru.
 * Shown on: Presensi → Lihat Sesi Aktif (Level 4).
 *
 * Features (Level 5 per HTA):
 *   - Resume Sesi  → POST /api/presensi/sesi/{id}/resume
 *   - Pause Sesi   → POST /api/presensi/sesi/{id}/pause
 *   - Finish Sesi  → POST /api/presensi/sesi/{id}/finish (with confirm)
 *
 * Data source: GET /api/presensi/sesi/aktif
 * Response: { success, data: { sessions: [...] } }
 *
 * @module components/guru/SesiAktif
 * @author fashich/dashboard-guru-page
 */

import { useState, useEffect, useCallback } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import './SesiAktif.css'

// ─── API helper ─────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiPost(url) {
  const res = await fetch(url, { method: 'POST', headers: getAuthHeaders() })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Request gagal.')
  return data
}

// ─── Jam labels ─────────────────────────────────────────────────────────────

const JAM_LABELS = {
  1: 'Jam 1', 2: 'Jam 2', 3: 'Jam 3', 4: 'Jam 4',
  5: 'Jam 5', 6: 'Jam 6', 7: 'Jam 7', 8: 'Jam 8',
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function IconPlay()  {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
}

function IconPause() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
}

function IconStop()  {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>
}

function IconEmpty() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3c.55 0 1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V7c0-.55.45-1 1-1z"/></svg>
}

function IconError() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
}

function IconRefresh() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatStatus(status) {
  if (status === 'aktif')     return { label: 'Aktif',   className: 'aktif' }
  if (status === 'suspended') return { label: 'Di-pause', className: 'suspended' }
  return { label: status, className: 'selesai' }
}

function formatMode(mode) {
  if (mode === 'rombel') return { label: 'Rombel', className: 'tag-rombel' }
  if (mode === 'piket')  return { label: 'Piket',  className: 'tag-piket' }
  return { label: mode, className: '' }
}

function formatTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// ─── Single session card ──────────────────────────────────────────────────────

function SesiCard({ sesi, onUpdate }) {
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const [confirmFinish,   setConfirmFinish]   = useState(false)

  const status  = formatStatus(sesi.status ?? sesi.status_sesi)
  const mode    = formatMode(sesi.mode_presensi)
  const jamIds  = sesi.jam_ids ?? []
  const sesiId  = sesi.presensi_sesi_id

  const isAktif     = (sesi.status ?? sesi.status_sesi) === 'aktif'
  const isSuspended = (sesi.status ?? sesi.status_sesi) === 'suspended'

  async function doAction(url) {
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost(url)
      if (typeof onUpdate === 'function') onUpdate(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="sesi-card">
      <div className={`sesi-card-bar status-${status.className}`} aria-hidden="true" />

      <div className="sesi-card-body">
        {/* Header */}
        <div className="sesi-card-header">
          <div className="sesi-card-info">
            <h3>
              Sesi #{sesiId}
              {sesi.label_rombel ? ` — ${sesi.label_rombel}` : ''}
            </h3>
            <div className="sesi-card-meta">
              <span className={`sesi-meta-tag ${mode.className}`}>{mode.label}</span>
              {sesi.ruang_label_snapshot && (
                <span className="sesi-meta-tag">{sesi.ruang_label_snapshot}</span>
              )}
              <span className="sesi-meta-tag">
                Mulai: {formatTime(sesi.started_at ?? sesi.created_at)}
              </span>
            </div>
          </div>

          <span className={`sesi-status-badge ${status.className}`}>
            <span className="status-dot" aria-hidden="true" />
            {status.label}
          </span>
        </div>

        {/* Jam list */}
        {jamIds.length > 0 && (
          <div className="sesi-jam-list" aria-label="Jam pembelajaran">
            {jamIds.map((id) => (
              <span key={id} className="sesi-jam-chip">
                {JAM_LABELS[id] ?? `Jam ${id}`}
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#dc2626' }}>{error}</p>
        )}

        {/* Confirm finish */}
        {confirmFinish && (
          <div className="finish-confirm" role="alert">
            <p style={{ margin: 0, fontWeight: 600 }}>
              Yakin ingin mengakhiri sesi ini? Tindakan tidak bisa dibatalkan.
            </p>
            <div className="finish-confirm-actions">
              <button
                type="button"
                className="btn-cancel-finish"
                onClick={() => setConfirmFinish(false)}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn-confirm-finish"
                onClick={() => doAction(`/api/presensi/sesi/${sesiId}/finish`)}
                disabled={loading}
              >
                {loading ? 'Mengakhiri...' : 'Ya, Akhiri Sesi'}
              </button>
            </div>
          </div>
        )}

        {/* Action buttons (Level 5) */}
        {!confirmFinish && (
          <div className="sesi-card-actions">
            {/* Resume — shown when suspended */}
            {isSuspended && (
              <button
                type="button"
                className="sesi-action-btn btn-resume"
                onClick={() => doAction(`/api/presensi/sesi/${sesiId}/resume`)}
                disabled={loading}
                aria-label="Resume sesi presensi"
              >
                <IconPlay />
                {loading ? 'Memproses...' : 'Resume Sesi'}
              </button>
            )}

            {/* Pause — shown when aktif */}
            {isAktif && (
              <button
                type="button"
                className="sesi-action-btn btn-pause"
                onClick={() => doAction(`/api/presensi/sesi/${sesiId}/pause`)}
                disabled={loading}
                aria-label="Pause sesi presensi"
              >
                <IconPause />
                {loading ? 'Memproses...' : 'Pause Sesi'}
              </button>
            )}

            {/* Finish — always shown */}
            <button
              type="button"
              className="sesi-action-btn btn-finish"
              onClick={() => setConfirmFinish(true)}
              disabled={loading}
              aria-label="Akhiri sesi presensi"
            >
              <IconStop />
              Akhiri Sesi
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SesiAktif
 *
 * Fetches and displays all active sessions for the current guru.
 * Allows resume, pause, and finish actions per session.
 *
 * @returns {preact.VNode}
 */
export default function SesiAktif() {
  const [sessions,  setSessions]  = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/presensi/sesi/aktif', {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat sesi.')
      setSessions(data.data?.sessions ?? [])
    } catch (err) {
      console.error('[SesiAktif] Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
    // Auto-refresh every 30s
    const interval = setInterval(fetchSessions, 30_000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  // When session is updated (resume/pause/finish), refresh list
  const handleSessionUpdate = useCallback(() => {
    fetchSessions()
  }, [fetchSessions])

  return (
    <section className="sesi-aktif-section" aria-label="Sesi Presensi Aktif">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <header>
          <h2 className="sesi-aktif-title">Sesi Presensi Aktif</h2>
          <p className="sesi-aktif-subtitle">
            Kelola sesi presensi yang sedang berlangsung.
          </p>
        </header>

        <button
          type="button"
          onClick={fetchSessions}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            border: '1.5px solid #e2e8f0', borderRadius: '8px',
            background: '#fff', color: '#64748b',
            fontFamily: 'Poppins, sans-serif', fontSize: '0.8rem', fontWeight: 500,
            cursor: 'pointer', flexShrink: 0,
          }}
          aria-label="Refresh daftar sesi"
        >
          <IconRefresh />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="sesi-state-box" role="status" aria-label="Memuat sesi">
          <div className="sesi-state-spinner" aria-hidden="true" />
          <p className="sesi-state-desc">Memuat sesi presensi...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="sesi-state-box">
          <div className="sesi-state-icon is-error" aria-hidden="true">
            <IconError />
          </div>
          <p className="sesi-state-title">Gagal Memuat Sesi</p>
          <p className="sesi-state-desc">{error}</p>
          <button type="button" className="sesi-retry-btn" onClick={fetchSessions}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && sessions.length === 0 && (
        <div className="sesi-state-box">
          <div className="sesi-state-icon" aria-hidden="true">
            <IconEmpty />
          </div>
          <p className="sesi-state-title">Tidak Ada Sesi Aktif</p>
          <p className="sesi-state-desc">
            Belum ada sesi presensi yang sedang berlangsung.
            Buat sesi baru di menu Dashboard Guru.
          </p>
        </div>
      )}

      {/* Session list */}
      {!isLoading && !error && sessions.length > 0 && (
        <div className="sesi-list" role="list">
          {sessions.map((sesi) => (
            <SesiCard
              key={sesi.presensi_sesi_id}
              sesi={sesi}
              onUpdate={handleSessionUpdate}
            />
          ))}
        </div>
      )}
    </section>
  )
}

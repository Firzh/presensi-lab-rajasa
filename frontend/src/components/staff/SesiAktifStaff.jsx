/**
 * SesiAktifStaff.jsx
 *
 * Displays active attendance sessions for the logged-in staff.
 * Shown on: Dashboard Staff → Lihat Sesi Aktif (Level 4).
 *
 * Features (Level 5 per HTA):
 *   - Resume Sesi
 *   - Pause Sesi
 *   - Finish Sesi (with confirm)
 *
 * Same logic as guru's SesiAktif but staff context (piket sessions only).
 *
 * @author fashich/dashboard-staff-page
 */

import { useState, useEffect, useCallback } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'

function getAuthHeaders() {
  const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

async function apiPost(url) {
  const res = await fetch(url, { method: 'POST', headers: getAuthHeaders() })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Request gagal.')
  return data
}

const JAM_LABELS = { 1:'Jam 1', 2:'Jam 2', 3:'Jam 3', 4:'Jam 4', 5:'Jam 5', 6:'Jam 6', 7:'Jam 7', 8:'Jam 8' }

const s = {
  section: { display:'flex', flexDirection:'column', gap:'1.5rem', fontFamily:'Poppins,sans-serif' },
  title:   { fontSize:'1.1rem', fontWeight:600, color:'var(--staff-text-base,#1e293b)', margin:0 },
  sub:     { fontSize:'0.8rem', color:'var(--staff-text-muted,#64748b)', margin:'0.2rem 0 0' },
  stateBox:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'3rem 2rem', background:'var(--staff-white,#fff)', border:'1px solid var(--staff-border,#e2e8f0)', borderRadius:14, textAlign:'center' },
  spinner: { width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#0284c7', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  card:    { background:'var(--staff-white,#fff)', border:'1px solid var(--staff-border,#e2e8f0)', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.05)' },
  cardBody:{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'1rem' },
  actions: { display:'flex', gap:'0.5rem', flexWrap:'wrap', borderTop:'1px solid #f1f5f9', paddingTop:'1rem' },
}

function ActionBtn({ label, color, icon, onClick, disabled, loading }) {
  const colors = { blue:'#0284c7', amber:'#f59e0b', red:'#ef4444' }
  return (
    <button
      type="button" onClick={onClick} disabled={disabled || loading}
      style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', border:'none', borderRadius:8, background: colors[color] || colors.blue, color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:'0.82rem', fontWeight:600, cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled || loading ? 0.6 : 1 }}
    >
      {icon}
      {loading ? 'Memproses...' : label}
    </button>
  )
}

function SesiCard({ sesi, onUpdate }) {
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const sesiId   = sesi.presensi_sesi_id
  const status   = sesi.status ?? sesi.status_sesi
  const isAktif  = status === 'aktif'
  const isPaused = status === 'suspended'
  const jamIds   = sesi.jam_ids ?? []

  async function doAction(url) {
    setLoading(true); setError(null)
    try { await apiPost(url); onUpdate?.() }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const statusColor = isAktif ? '#10b981' : isPaused ? '#f59e0b' : '#94a3b8'
  const statusLabel = isAktif ? 'Aktif' : isPaused ? 'Di-pause' : status

  return (
    <article style={s.card}>
      <div style={{ height:4, background: statusColor }} aria-hidden="true" />
      <div style={s.cardBody}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <h3 style={{ margin:'0 0 0.25rem', fontSize:'1rem', fontWeight:700, color:'var(--staff-text-base,#1e293b)' }}>
              Sesi #{sesiId} — Piket
            </h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
              <span style={{ padding:'0.2rem 0.6rem', borderRadius:99, fontSize:'0.72rem', fontWeight:600, background:'#fef3c7', color:'#b45309' }}>Piket</span>
              {sesi.ruang_label_snapshot && (
                <span style={{ padding:'0.2rem 0.6rem', borderRadius:99, fontSize:'0.72rem', fontWeight:600, background:'#f1f5f9', color:'#64748b' }}>{sesi.ruang_label_snapshot}</span>
              )}
            </div>
          </div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.35rem 0.75rem', borderRadius:99, fontSize:'0.78rem', fontWeight:600, background: isAktif ? '#dcfce7' : isPaused ? '#fef3c7' : '#f1f5f9', color: isAktif ? '#15803d' : isPaused ? '#b45309' : '#64748b', whiteSpace:'nowrap' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'currentColor' }} aria-hidden="true" />
            {statusLabel}
          </span>
        </div>

        {jamIds.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
            {jamIds.map((id) => (
              <span key={id} style={{ padding:'0.2rem 0.55rem', borderRadius:6, fontSize:'0.72rem', fontWeight:600, background:'#e0f2fe', color:'#0369a1' }}>
                {JAM_LABELS[id] ?? `Jam ${id}`}
              </span>
            ))}
          </div>
        )}

        {error && <p style={{ margin:0, fontSize:'0.82rem', color:'#dc2626' }}>{error}</p>}

        {confirmFinish ? (
          <div style={{ padding:'1rem', background:'#fff5f5', border:'1px solid #fca5a5', borderRadius:10, display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#dc2626', fontWeight:600 }}>Yakin ingin mengakhiri sesi ini?</p>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button type="button" onClick={() => setConfirmFinish(false)} disabled={loading} style={{ padding:'0.35rem 0.85rem', border:'1.5px solid #fca5a5', borderRadius:6, background:'#fff', color:'#dc2626', fontFamily:'Poppins,sans-serif', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>Batal</button>
              <button type="button" onClick={() => doAction(`/api/presensi/sesi/${sesiId}/finish`)} disabled={loading} style={{ padding:'0.35rem 0.85rem', border:'none', borderRadius:6, background:'#ef4444', color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>
                {loading ? 'Mengakhiri...' : 'Ya, Akhiri'}
              </button>
            </div>
          </div>
        ) : (
          <div style={s.actions}>
            {isPaused && <ActionBtn label="Resume Sesi" color="blue" onClick={() => doAction(`/api/presensi/sesi/${sesiId}/resume`)} loading={loading} icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>} />}
            {isAktif  && <ActionBtn label="Pause Sesi"  color="amber" onClick={() => doAction(`/api/presensi/sesi/${sesiId}/pause`)}  loading={loading} icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>} />}
            <ActionBtn label="Akhiri Sesi" color="red" onClick={() => setConfirmFinish(true)} disabled={loading} icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>} />
          </div>
        )}
      </div>
    </article>
  )
}

export default function SesiAktifStaff() {
  const [sessions,  setSessions]  = useState([])
  const [isLoading, setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/presensi/sesi/aktif', { headers: getAuthHeaders() })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat sesi.')
      setSessions(data.data?.sessions ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 30_000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  return (
    <section style={s.section} aria-label="Sesi Aktif Staff">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
        <header>
          <h2 style={s.title}>Lihat Sesi Aktif</h2>
          <p style={s.sub}>Kelola sesi presensi yang sedang berlangsung.</p>
        </header>
        <button type="button" onClick={fetchSessions} disabled={isLoading} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.45rem 0.85rem', border:'1.5px solid var(--staff-border,#e2e8f0)', borderRadius:8, background:'var(--staff-white,#fff)', color:'var(--staff-text-muted,#64748b)', fontFamily:'Poppins,sans-serif', fontSize:'0.8rem', fontWeight:500, cursor:'pointer', flexShrink:0 }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          Refresh
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {isLoading && (
        <div style={s.stateBox}>
          <div style={s.spinner} />
          <p style={{ margin:0, fontSize:'0.82rem', color:'var(--staff-text-muted,#64748b)' }}>Memuat sesi...</p>
        </div>
      )}

      {!isLoading && error && (
        <div style={s.stateBox}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#ef4444"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p style={{ margin:0, fontSize:'0.9rem', fontWeight:600, color:'#475569' }}>Gagal Memuat</p>
          <p style={{ margin:0, fontSize:'0.82rem', color:'#94a3b8' }}>{error}</p>
          <button type="button" onClick={fetchSessions} style={{ padding:'0.4rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#fff', color:'#64748b', fontFamily:'Poppins,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Coba Lagi</button>
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <div style={s.stateBox}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#94a3b8"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3c.55 0 1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V7c0-.55.45-1 1-1z"/></svg>
          </div>
          <p style={{ margin:0, fontSize:'0.9rem', fontWeight:600, color:'#475569' }}>Tidak Ada Sesi Aktif</p>
          <p style={{ margin:0, fontSize:'0.82rem', color:'#94a3b8' }}>Buat sesi piket baru di menu Sesi.</p>
        </div>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {sessions.map((sesi) => (
            <SesiCard key={sesi.presensi_sesi_id} sesi={sesi} onUpdate={fetchSessions} />
          ))}
        </div>
      )}
    </section>
  )
}

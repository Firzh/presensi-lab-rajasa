/**
 * BuatSesiPiket.jsx
 *
 * Form to create a piket attendance session.
 * Shown on: Sesi → Buat Sesi Piket (Level 4).
 *
 * Differences from Guru's BuatSesiPresensi:
 *   - Mode PIKET only (no Rombel)
 *   - Jam 1–3 only (per HTA Level 5)
 *
 * API: POST /api/presensi/sesi
 * Body: { mode_presensi: 'piket', jam_ids: number[] }
 *
 * @author fashich/dashboard-staff-page
 */

import { useState, useCallback } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'

function getAuthHeaders() {
  const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Level 5: Jam 1–3 only
const JAM_LIST = [
  { jam_id: 1, label: 'Jam 1', time: '07:00' },
  { jam_id: 2, label: 'Jam 2', time: '07:45' },
  { jam_id: 3, label: 'Jam 3', time: '08:30' },
]

function IconSend()  { return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg> }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> }
function IconAlert() { return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> }

const styles = {
  section: { display:'flex', flexDirection:'column', gap:'1.5rem', fontFamily:'Poppins,sans-serif', maxWidth:520 },
  title:   { fontSize:'1.1rem', fontWeight:600, color:'var(--staff-text-base,#1e293b)', margin:0 },
  sub:     { fontSize:'0.8rem', color:'var(--staff-text-muted,#64748b)', margin:'0.2rem 0 0' },
  card:    { background:'var(--staff-white,#fff)', border:'1px solid var(--staff-border,#e2e8f0)', borderRadius:14, padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,.05)' },
  label:   { fontSize:'0.82rem', fontWeight:600, color:'#374151', marginBottom:'0.5rem', display:'block' },
  jamGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' },
  jamLabel:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.15rem', padding:'0.75rem 0.5rem', border:'2px solid var(--staff-border,#e2e8f0)', borderRadius:10, background:'var(--staff-bg,#f8fafc)', color:'var(--staff-text-muted,#64748b)', fontFamily:'Poppins,sans-serif', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s', textAlign:'center' },
  submitBtn:{ width:'100%', padding:'0.8rem', border:'none', borderRadius:10, background:'#0284c7', color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', transition:'background 0.15s' },
  alert:   { padding:'0.875rem 1rem', borderRadius:10, fontSize:'0.85rem', fontWeight:500, display:'flex', alignItems:'flex-start', gap:'0.6rem' },
  successIcon: { width:64, height:64, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' },
}

export default function BuatSesiPiket() {
  const [selectedJam,  setSelectedJam]  = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError,  setSubmitError]  = useState(null)
  const [createdSesi,  setCreatedSesi]  = useState(null)

  const toggleJam = useCallback((id) => {
    setSelectedJam((prev) => prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id].sort((a,b) => a-b))
  }, [])

  const resetForm = useCallback(() => {
    setSelectedJam([]); setSubmitError(null); setCreatedSesi(null)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSubmitError(null)
    if (selectedJam.length === 0) { setSubmitError('Pilih minimal 1 jam.'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/presensi/sesi', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ mode_presensi: 'piket', jam_ids: selectedJam }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal membuat sesi.')
      setCreatedSesi(data.data)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedJam])

  if (createdSesi) {
    return (
      <section style={styles.section}>
        <header><h2 style={styles.title}>Buat Sesi Piket</h2></header>
        <div style={styles.card}>
          <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'1rem' }}>
            <div style={styles.successIcon}><IconCheck /></div>
            <h3 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'var(--staff-text-base,#1e293b)' }}>Sesi Piket Berhasil Dibuat!</h3>
            <p style={{ margin:0, fontSize:'0.85rem', color:'var(--staff-text-muted,#64748b)' }}>Sesi presensi piket sudah aktif. Siswa dapat melakukan absensi sekarang.</p>
            <button type="button" onClick={resetForm} style={{ padding:'0.55rem 1.25rem', border:'1.5px solid #0284c7', borderRadius:8, background:'transparent', color:'#0284c7', fontFamily:'Poppins,sans-serif', fontSize:'0.85rem', fontWeight:600, cursor:'pointer' }}>
              Buat Sesi Baru
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={styles.section}>
      <header>
        <h2 style={styles.title}>Buat Sesi Piket</h2>
        <p style={styles.sub}>Buat sesi presensi mode piket untuk jam 1–3.</p>
      </header>

      <form style={styles.card} onSubmit={handleSubmit} noValidate>
        {/* Mode info (Level 5: Mode Piket only) */}
        <div style={{ padding:'0.875rem 1rem', borderRadius:10, background:'#f0fdf4', border:'1px solid #86efac', color:'#15803d', fontSize:'0.85rem', fontWeight:500, display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          Mode Piket — digunakan untuk presensi tanpa kelas/rombel tertentu
        </div>

        {/* Pilih Jam 1–3 (Level 5) */}
        <div>
          <span style={styles.label}>Pilih Jam <span style={{ color:'#ef4444' }}>*</span></span>
          <div style={styles.jamGrid}>
            {JAM_LIST.map((jam) => {
              const isChecked = selectedJam.includes(jam.jam_id)
              return (
                <div key={jam.jam_id}>
                  <input
                    type="checkbox" id={`jam-${jam.jam_id}`}
                    style={{ position:'absolute', opacity:0, width:0, height:0 }}
                    checked={isChecked}
                    onChange={() => toggleJam(jam.jam_id)}
                  />
                  <label
                    htmlFor={`jam-${jam.jam_id}`}
                    style={{
                      ...styles.jamLabel,
                      ...(isChecked ? { border:'2px solid #0284c7', background:'#0284c7', color:'#fff', boxShadow:'0 1px 4px rgba(2,132,199,.3)' } : {}),
                    }}
                  >
                    {jam.label}
                    <span style={{ fontSize:'0.68rem', fontWeight:400, opacity:0.8 }}>{jam.time}</span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        {submitError && (
          <div style={{ ...styles.alert, background:'#fff5f5', border:'1px solid #fca5a5', color:'#dc2626' }} role="alert">
            <IconAlert /><span>{submitError}</span>
          </div>
        )}

        <button type="submit" style={{ ...styles.submitBtn, ...(isSubmitting ? { opacity:0.6, cursor:'not-allowed' } : {}) }} disabled={isSubmitting}>
          <IconSend style={{ width:18, height:18 }} />
          {isSubmitting ? 'Membuat Sesi...' : 'Buat Sesi Piket'}
        </button>
      </form>
    </section>
  )
}

import { useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import useResumeStore from '../store/resumeStore'
import PreviewPanel from '../components/preview/PreviewPanel'
import ATSScore from '../components/ui/ATSScore'
import '../styles/editor.css'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef(null)

  const {
    resume, loading, saving, lastSaved, error,
    loadResume, saveResume, updateTitle, downloadPdf, updateFont,
  } = useResumeStore()

  useEffect(() => { loadResume(id) }, [id])

  useEffect(() => {
    if (!resume) return
    const t = setTimeout(() => saveResume(), 30_000)
    return () => clearTimeout(t)
  }, [resume?.data])

  const handlePrint = useReactToPrint({ contentRef: printRef })

  const handleSave = useCallback(async () => {
    await saveResume()
  }, [saveResume])

  const handleDownloadPdf = useCallback(async () => {
    await downloadPdf()
  }, [downloadPdf])

  if (loading && !resume) {
    return (
      <div className="editor-loading">
        <div className="spinner" />
        <p>Loading resume…</p>
      </div>
    )
  }

  if (error && !resume) {
    return (
      <div className="editor-error">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>← Back</button>
      </div>
    )
  }

  if (!resume) return null

  const fmtSaved = lastSaved
    ? lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="editor-page">
      <header className="editor-topbar">
        <div className="topbar-left">
          <button id="btn-back" className="topbar-back" onClick={() => navigate('/')}>
            ← Back
          </button>
          <input
            id="resume-title-field"
            className="topbar-title-input"
            type="text"
            value={resume.title}
            onChange={e => updateTitle(e.target.value)}
            onBlur={saveResume}
            placeholder="Resume title"
          />
        </div>

        <div className="topbar-center">
          <ATSScore data={resume.data} />
        </div>

        <div className="topbar-right">
          <select
            id="font-select"
            className="topbar-select"
            value={resume.data?.font || 'Inter'}
            onChange={e => {
              updateFont(e.target.value)
              setTimeout(() => saveResume(), 100)
            }}
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '13px',
              marginRight: '8px',
              cursor: 'pointer'
            }}
          >
            <option value="Inter">Font: Inter</option>
            <option value="Outfit">Font: Outfit</option>
            <option value="Roboto">Font: Roboto</option>
            <option value="Lora">Font: Lora</option>
            <option value="Georgia">Font: Georgia</option>
            <option value="Arial">Font: Arial</option>
          </select>
          <span className="save-status">
            {saving ? '⟳ Saving…' : fmtSaved ? `✓ Saved ${fmtSaved}` : ''}
          </span>
          <button id="btn-save" className="topbar-btn" onClick={handleSave} disabled={saving}>
            Save
          </button>
          <button id="btn-print" className="topbar-btn" onClick={handlePrint}>
            Print
          </button>
          <button id="btn-download-pdf" className="topbar-btn topbar-btn-primary" onClick={handleDownloadPdf}>
            ↓ Download PDF
          </button>
        </div>
      </header>

      <div className="editor-body">
        <main className="editor-right full-canvas">
          <PreviewPanel printRef={printRef} />
        </main>
      </div>
    </div>
  )
}

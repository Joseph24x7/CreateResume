import React, { useCallback, useEffect, useRef, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import useResumeStore from '../../store/resumeStore'

const SELECT_STYLE = {
  background: 'var(--surface-2)',
  color: 'var(--text-1)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 12px',
  fontSize: '13px',
  marginRight: '8px',
  cursor: 'pointer',
}

/**
 * EditorTopbar — isolated from resume content changes.
 * Uses narrow Zustand selectors so it only re-renders when
 * toolbar-relevant data changes (title, template, font, size,
 * save status, undo/redo stack length), NOT on every keystroke.
 */
const EditorTopbar = memo(function EditorTopbar({ printRef, zoom, setZoom, onDownloadPdf, pdfLoading, onPrint, centerSlot }) {
  const navigate = useNavigate()

  // ── Narrow selectors: only the fields the toolbar actually needs ──────────
  const resumeId      = useResumeStore(s => s.resume?.id)
  const resumeTitle   = useResumeStore(s => s.resume?.title ?? '')
  const template      = useResumeStore(s => s.resume?.data?.template ?? 'executive-navy')
  const font          = useResumeStore(s => s.resume?.data?.font ?? 'Mantika Sans')
  const fontSize      = useResumeStore(s => s.resume?.data?.fontSize ?? 'medium')
  const saving        = useResumeStore(s => s.saving)
  const lastSaved     = useResumeStore(s => s.lastSaved)
  const undoLen       = useResumeStore(s => s.undoHistory.length)
  const redoLen       = useResumeStore(s => s.redoHistory.length)

  const {
    updateTitle, updateTemplate, updateFont, updateFontSize, undo, redo,
  } = useResumeStore.getState()

  // ── Relative "saved X ago" status ─────────────────────────────────────────
  const [savedStatus, setSavedStatus] = useState('')

  useEffect(() => {
    if (saving) { setSavedStatus('Saving…'); return }
    if (!lastSaved) { setSavedStatus(''); return }

    const update = () => {
      const diffSec = Math.floor((Date.now() - new Date(lastSaved).getTime()) / 1000)
      if (diffSec < 5) setSavedStatus('Saved just now')
      else if (diffSec < 60) setSavedStatus(`Saved ${diffSec}s ago`)
      else setSavedStatus(`Saved ${Math.floor(diffSec / 60)}m ago`)
    }

    update()
    const iv = setInterval(update, 5000)
    return () => clearInterval(iv)
  }, [lastSaved, saving])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key?.toLowerCase() === 'z') {
        if (e.shiftKey) { if (redoLen > 0) { e.preventDefault(); redo() } }
        else            { if (undoLen > 0) { e.preventDefault(); undo() } }
      } else if (mod && e.key?.toLowerCase() === 'y') {
        if (redoLen > 0) { e.preventDefault(); redo() }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, undoLen, redoLen])

  if (!resumeId) return null

  return (
    <header className="editor-topbar">
      <div className="topbar-left">
        <button id="btn-back" className="topbar-back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <input
          id="resume-title-field"
          className="topbar-title-input"
          type="text"
          value={resumeTitle}
          onChange={e => updateTitle(e.target.value)}
          placeholder="Resume title"
        />
      </div>

      <div className="topbar-center">
        {centerSlot}
      </div>

      <div className="topbar-right">
        <select
          id="template-select"
          className="topbar-select"
          value={template}
          onChange={e => updateTemplate(e.target.value)}
          style={SELECT_STYLE}
        >
          <option value="executive-navy">Template: Executive Navy</option>
          <option value="minimalist-accent">Template: Minimalist Accent</option>
          <option value="elegant-diamond">Template: Elegant Diamond</option>
        </select>

        <select
          id="font-select"
          className="topbar-select"
          value={font}
          onChange={e => updateFont(e.target.value)}
          style={SELECT_STYLE}
        >
          <option value="Mantika Sans">Font: Mantika Sans</option>
          <option value="Inter">Font: Inter</option>
          <option value="Outfit">Font: Outfit</option>
          <option value="Plus Jakarta Sans">Font: Plus Jakarta Sans</option>
          <option value="Montserrat">Font: Montserrat</option>
          <option value="Playfair Display">Font: Playfair Display</option>
          <option value="Merriweather">Font: Merriweather</option>
        </select>

        <select
          id="font-size-select"
          className="topbar-select"
          value={fontSize}
          onChange={e => updateFontSize(e.target.value)}
          style={SELECT_STYLE}
        >
          <option value="small">Size: Small</option>
          <option value="medium">Size: Medium</option>
          <option value="large">Size: Large</option>
        </select>

        <select
          id="zoom-select"
          className="topbar-select"
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={SELECT_STYLE}
          title="Adjust preview zoom"
        >
          <option value={0.75}>Zoom: 75%</option>
          <option value={0.9}>Zoom: 90%</option>
          <option value={1}>Zoom: 100%</option>
          <option value={1.1}>Zoom: 110%</option>
          <option value={1.25}>Zoom: 125%</option>
        </select>

        <button
          id="btn-undo"
          className="topbar-btn"
          onClick={undo}
          disabled={undoLen === 0}
          style={{ opacity: undoLen === 0 ? 0.4 : 1 }}
          title="Undo (Ctrl+Z)"
        >
          ⎌ Undo
        </button>

        <button
          id="btn-redo"
          className="topbar-btn"
          onClick={redo}
          disabled={redoLen === 0}
          style={{ opacity: redoLen === 0 ? 0.4 : 1, marginRight: '8px' }}
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷ Redo
        </button>

        <span className="save-status" style={{ marginRight: '8px' }}>
          {savedStatus}
        </span>

        <button id="btn-print" className="topbar-btn" onClick={onPrint}>
          Print
        </button>

        <button
          id="btn-download-pdf"
          className="topbar-btn topbar-btn-primary"
          onClick={onDownloadPdf}
          disabled={pdfLoading}
        >
          {pdfLoading ? '⟳ Generating…' : '↓ Download PDF'}
        </button>
      </div>
    </header>
  )
})

export default EditorTopbar

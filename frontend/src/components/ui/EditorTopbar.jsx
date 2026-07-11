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
  const font          = useResumeStore(s => s.resume?.data?.font ?? 'Merriweather Sans')
  const fontSize      = useResumeStore(s => s.resume?.data?.fontSize ?? 'medium')
  const showMonogram  = useResumeStore(s => s.resume?.data?.showMonogram ?? false)

  const saving        = useResumeStore(s => s.saving)
  const lastSaved     = useResumeStore(s => s.lastSaved)
  const undoLen       = useResumeStore(s => s.undoHistory.length)
  const redoLen       = useResumeStore(s => s.redoHistory.length)


  const {
    updateTitle, updateTemplate, updateFont, updateFontSize, updateData, undo, redo,
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

        {/* Monogram Toggle (Elegant Diamond only) */}
        {template === 'elegant-diamond' && (
          <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-1)', fontSize: '13px', marginRight: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showMonogram}
              onChange={e => updateData({ showMonogram: e.target.checked })}
              style={{ marginRight: '6px', cursor: 'pointer' }}
            />
            ◈ Monogram
          </label>
        )}

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
          <option value="Merriweather Sans">Font: Merriweather Sans</option>
          <option value="Mantika Sans">Font: Mantika Sans</option>
          <option value="Inter">Font: Inter</option>
          <option value="Outfit">Font: Outfit</option>
          <option value="Halyard Text">Font: Halyard Text</option>
          <option value="Minion 3 Display">Font: Minion 3</option>
          <option value="Spinoza Pro">Font: Spinoza Pro</option>
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

        {/* Zoom Presets & Slider */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px', gap: '6px' }}>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ width: '70px', cursor: 'pointer' }}
            title="Adjust Zoom"
          />
          <span style={{ fontSize: '12px', color: 'var(--text-2)', minWidth: '36px', textAlign: 'right' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <button
          className="topbar-btn"
          style={{ padding: '6px 8px', fontSize: '11px', marginRight: '4px' }}
          onClick={() => setZoom(1.0)}
          title="Zoom to Fit Width"
        >
          ↔ Width
        </button>
        <button
          className="topbar-btn"
          style={{ padding: '6px 8px', fontSize: '11px', marginRight: '8px' }}
          onClick={() => setZoom(0.85)}
          title="Zoom to Fit Page height"
        >
          ↕ Page
        </button>

        {/* Shortcuts indicator */}
        <span style={{ fontSize: '11px', color: 'var(--text-3)', marginRight: '8px' }} title="Undo: Ctrl+Z / Redo: Ctrl+Y">
          ⌨ Keys active
        </span>

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


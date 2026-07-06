import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import useResumeStore from '../store/resumeStore'
import PreviewPanel from '../components/preview/PreviewPanel'
import ATSScore from '../components/ui/ATSScore'
import { generatePdfFromPreview } from '../utils/pdfGenerator'
import '../styles/editor.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Editor page crash caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="editor-error" style={{ padding: '40px', textAlign: 'center', background: 'var(--background)', color: 'var(--text-1)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Something went wrong displaying this resume.</h2>
          <p style={{ margin: '16px 0', color: 'var(--text-2)', maxWidth: '500px', lineHeight: '1.6' }}>{this.state.error?.message || String(this.state.error)}</p>
          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            ← Go to Home Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [savedStatus, setSavedStatus] = useState('')

  const {
    resume, loading, saving, lastSaved, error,
    loadResume, saveResume, updateTitle, updateFont, updateTemplate, updateFontSize,
    undo, redo, undoHistory, redoHistory
  } = useResumeStore()

  useEffect(() => { loadResume(id) }, [id])

  // Ctrl+Z (Undo) and Ctrl+Shift+Z / Ctrl+Y (Redo) listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey
      if (isCtrlOrMeta && e.key?.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (redoHistory.length > 0) {
            e.preventDefault()
            redo()
          }
        } else {
          if (undoHistory.length > 0) {
            e.preventDefault()
            undo()
          }
        }
      } else if (isCtrlOrMeta && e.key?.toLowerCase() === 'y') {
        if (redoHistory.length > 0) {
          e.preventDefault()
          redo()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, undoHistory, redoHistory])

  // Debounced Auto Save (runs 1000ms after last data edit)
  useEffect(() => {
    if (!resume) return
    const t = setTimeout(() => {
      saveResume()
    }, 1000)
    return () => clearTimeout(t)
  }, [resume?.data, saveResume])

  // Calculate dynamic relative saved status string
  useEffect(() => {
    if (saving) {
      setSavedStatus('Saving…')
      return
    }
    if (!lastSaved) {
      setSavedStatus('')
      return
    }

    const updateStatus = () => {
      const diffMs = Date.now() - new Date(lastSaved).getTime()
      const diffSec = Math.floor(diffMs / 1000)
      if (diffSec < 5) {
        setSavedStatus('Saved just now')
      } else if (diffSec < 60) {
        setSavedStatus(`Saved ${diffSec}s ago`)
      } else {
        const diffMin = Math.floor(diffSec / 60)
        setSavedStatus(`Saved ${diffMin}m ago`)
      }
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000)
    return () => clearInterval(interval)
  }, [lastSaved, saving])

  const handlePrint = useReactToPrint({ contentRef: printRef })

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current) return
    setPdfLoading(true)
    try {
      const filename = (resume?.title || 'resume').replace(/[^a-zA-Z0-9\-_ ]/g, '_') + '.pdf'
      await generatePdfFromPreview(printRef.current, filename)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }, [resume?.title, printRef])

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

  return (
    <ErrorBoundary>
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
            value={resume.title || ''}
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
            id="template-select"
            className="topbar-select"
            value={resume.data?.template || 'executive-navy'}
            onChange={e => {
              updateTemplate(e.target.value)
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
            <option value="executive-navy">Template: Executive Navy</option>
            <option value="minimalist-accent">Template: Minimalist Accent</option>
            <option value="elegant-diamond">Template: Elegant Diamond</option>
          </select>

          <select
            id="font-select"
            className="topbar-select"
            value={resume.data?.font || 'Inter'}
            onChange={e => {
              updateFont(e.target.value)
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
            value={resume.data?.fontSize || 'medium'}
            onChange={e => {
              updateFontSize(e.target.value)
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
            <option value="small">Size: Small</option>
            <option value="medium">Size: Medium</option>
            <option value="large">Size: Large</option>
          </select>

          <button
            id="btn-undo"
            className="topbar-btn"
            onClick={undo}
            disabled={undoHistory.length === 0}
            style={{
              opacity: undoHistory.length === 0 ? 0.4 : 1,
              cursor: undoHistory.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ⎌ Undo
          </button>
          
          <button
            id="btn-redo"
            className="topbar-btn"
            onClick={redo}
            disabled={redoHistory.length === 0}
            style={{
              opacity: redoHistory.length === 0 ? 0.4 : 1,
              cursor: redoHistory.length === 0 ? 'not-allowed' : 'pointer',
              marginRight: '8px'
            }}
          >
            ↷ Redo
          </button>

          <span className="save-status" style={{ marginRight: '8px' }}>
            {savedStatus}
          </span>

          <button id="btn-print" className="topbar-btn" onClick={handlePrint}>
            Print
          </button>
          
          <button
            id="btn-download-pdf"
            className="topbar-btn topbar-btn-primary"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? '⟳ Generating…' : '↓ Download PDF'}
          </button>
        </div>
      </header>

      <div className="editor-body">
        <main className="editor-right full-canvas">
          <PreviewPanel printRef={printRef} />
        </main>
      </div>
    </div>
    </ErrorBoundary>
  )
}

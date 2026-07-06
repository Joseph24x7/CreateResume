import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import useResumeStore from '../store/resumeStore'
import PreviewPanel from '../components/preview/PreviewPanel'
import ATSScore from '../components/ui/ATSScore'
import EditorTopbar from '../components/ui/EditorTopbar'
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
    console.error('Editor page crash caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="editor-error"
          style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg)',
            color: 'var(--text-1)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>
            Something went wrong displaying this resume.
          </h2>
          <p style={{ margin: '16px 0', color: 'var(--text-2)', maxWidth: '500px', lineHeight: '1.6' }}>
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button className="btn-primary" onClick={() => (window.location.href = '/')}>
            ← Go to Home Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * ATSWrapper — reads data directly from the store with a narrow selector.
 * Re-renders independently of EditorPage and EditorTopbar.
 */
function ATSWrapper() {
  const data = useResumeStore(s => s.resume?.data)
  if (!data) return null
  return <ATSScore data={data} />
}

export default function EditorPage() {
  const { id } = useParams()
  const printRef = useRef(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [zoom, setZoom] = useState(1)

  // EditorPage only reads the minimum it needs for lifecycle management
  const loading = useResumeStore(s => s.loading)
  const error   = useResumeStore(s => s.error)
  const hasResume = useResumeStore(s => !!s.resume)
  const { loadResume, saveResume } = useResumeStore.getState()

  // Stable save ref — avoids stale closure in auto-save effect
  const saveResumeRef = useRef(saveResume)
  useEffect(() => {
    saveResumeRef.current = useResumeStore.getState().saveResume
  })

  // Load resume on mount / id change
  useEffect(() => { loadResume(id) }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save: only fires when actual title or data content changes, avoiding infinite loops ──
  const resumeTitle = useResumeStore(s => s.resume?.title)
  const resumeData  = useResumeStore(s => s.resume?.data)
  const resumeId    = useResumeStore(s => s.resume?.id)
  const serializedRef = useRef('')

  // Initialize the ref on load or resume switch
  useEffect(() => {
    if (resumeId && resumeData) {
      serializedRef.current = JSON.stringify({ title: resumeTitle, data: resumeData })
    }
  }, [resumeId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!resumeData) return
    const currentSerialized = JSON.stringify({ title: resumeTitle, data: resumeData })
    if (currentSerialized === serializedRef.current) return

    const t = setTimeout(() => {
      saveResumeRef.current()
      serializedRef.current = currentSerialized
    }, 1000)
    return () => clearTimeout(t)
  }, [resumeTitle, resumeData])

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({ contentRef: printRef })

  // ── PDF download ──────────────────────────────────────────────────────────
  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current) return
    setPdfLoading(true)
    try {
      const resumeTitle = useResumeStore.getState().resume?.title
      const filename = (resumeTitle || 'resume').replace(/[^a-zA-Z0-9\-_ ]/g, '_') + '.pdf'
      await generatePdfFromPreview(printRef.current, filename)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setPdfLoading(false)
    }
  }, [])

  // ── ATS score slot — memoized, reads from store independently ─────────────
  const atsSlot = <ATSWrapper />

  if (loading && !hasResume) {
    return (
      <div className="editor-loading">
        <div className="spinner" />
        <p>Loading resume…</p>
      </div>
    )
  }

  if (error && !hasResume) {
    return (
      <div className="editor-error">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.href = '/'}>← Back</button>
      </div>
    )
  }

  if (!hasResume) return null

  return (
    <ErrorBoundary>
      <div className="editor-page">

        {/*
          EditorTopbar is a React.memo component with narrow store selectors.
          It does NOT re-render when resume content (experiences, skills, etc.) changes.
          It only re-renders on: title, template, font, size, save status, undo/redo count.
        */}
        <EditorTopbar
          printRef={printRef}
          zoom={zoom}
          setZoom={setZoom}
          onDownloadPdf={handleDownloadPdf}
          pdfLoading={pdfLoading}
          onPrint={handlePrint}
          centerSlot={atsSlot}
        />

        <div className="editor-body">
          <main className="editor-right full-canvas">
            <PreviewPanel printRef={printRef} zoom={zoom} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

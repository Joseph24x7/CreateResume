import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import useResumeStore from '../store/resumeStore'
import PreviewPanel from '../components/preview/PreviewPanel'
import ATSScore from '../components/ui/ATSScore'
import EditorTopbar from '../components/ui/EditorTopbar'
import CoverLetterWorkspace from '../components/workspace/CoverLetterWorkspace'
import ATSCheckerWorkspace from '../components/workspace/ATSCheckerWorkspace'
import PortfolioWorkspace from '../components/workspace/PortfolioWorkspace'
import InterviewWorkspace from '../components/workspace/InterviewWorkspace'
import JobTrackerWorkspace from '../components/workspace/JobTrackerWorkspace'
import OfferComparisonWorkspace from '../components/workspace/OfferComparisonWorkspace'
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

const fetchAsDataUri = async (url) => {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const getActiveStyles = async () => {
  let cssText = ''
  const fontUrls = new Map() // url string -> data URI

  try {
    for (const sheet of document.styleSheets) {
      try {
        if (!sheet.cssRules) continue
      } catch { continue }

      for (const rule of sheet.cssRules) {
        cssText += rule.cssText + '\n'
      }
    }
  } catch (e) {
    console.error('Failed to read stylesheets:', e)
  }

  // Find all url() references to font files (woff2, woff, ttf, otf)
  const urlRegex = /url\(["']?([^"')]+\.(?:woff2?|ttf|otf))["']?\)/gi
  const matches = [...cssText.matchAll(urlRegex)]

  for (const match of matches) {
    const originalUrl = match[1]
    if (originalUrl.startsWith('data:')) continue
    if (!fontUrls.has(originalUrl)) {
      const dataUri = await fetchAsDataUri(originalUrl)
      if (dataUri) fontUrls.set(originalUrl, dataUri)
    }
  }

  // Replace all font URLs with their data URIs
  for (const [originalUrl, dataUri] of fontUrls) {
    cssText = cssText.replaceAll(originalUrl, dataUri)
  }

  return cssText
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
  const [activeTab, setActiveTab] = useState('editor')
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')

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
      const cssText = await getActiveStyles()
      const printEl = printRef.current

      // Measure content and calculate pages exactly like the preview does
      const resumeEl = printEl.querySelector('.en-resume')
      const contentHeight = resumeEl ? resumeEl.scrollHeight : printEl.scrollHeight
      const PAGE_1_H = 1087
      const PAGE_N_H = 1051
      const numPages = contentHeight <= PAGE_1_H ? 1 : 1 + Math.ceil((contentHeight - PAGE_1_H) / PAGE_N_H)

      // Clone the print element to avoid mutating the live DOM
      const clone = printEl.cloneNode(true)
      clone.style.cssText = 'position:static;width:794px;height:auto;background:#fff;margin:0;padding:0;z-index:auto;'
      const fullContent = clone.innerHTML

      // Fetch Google Fonts CSS and embed it inline
      let googleFontsCss = ''
      try {
        const gfRes = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&family=Roboto:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Merriweather+Sans:ital,wght@0,300;0,400;0,700;0,800;1,300;1,400;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap')
        if (gfRes.ok) googleFontsCss = await gfRes.text()
      } catch { /* continue without */ }

      // Build individual page divs — each page clips a viewport window over the full content
      let pagesHtml = ''
      for (let i = 0; i < numPages; i++) {
        const clipH = i === 0 ? PAGE_1_H : PAGE_N_H
        const topOffset = i === 0 ? 0 : PAGE_1_H + (i - 1) * PAGE_N_H
        const topPad = i === 0 ? 0 : 36  // subsequent pages have top margin
        const pageBreak = i < numPages - 1 ? 'page-break-after: always;' : ''

        pagesHtml += `
<div style="width:794px; height:1123px; position:relative; overflow:hidden; ${pageBreak} box-sizing:border-box;">
  <div style="position:absolute; top:${topPad}px; left:0; width:794px; height:${clipH}px; overflow:hidden;">
    <div style="position:absolute; top:${-topOffset}px; left:0; width:794px;">
      ${fullContent}
    </div>
  </div>
</div>`
      }

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4 portrait; margin: 0 !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: white; }
    ${googleFontsCss}
    ${cssText}
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`

      await useResumeStore.getState().downloadPdf(fullHtml)
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
          {/* LEFT WORKSPACE SIDEBAR */}
          <aside className="workspace-sidebar">
            <button 
              className={`sidebar-tab ${activeTab === 'editor' ? 'active' : ''}`} 
              onClick={() => setActiveTab('editor')}
              title="Resume Builder"
            >
              <span className="tab-icon">📄</span>
              <span className="tab-label">Resume</span>
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'cover-letter' ? 'active' : ''}`} 
              onClick={() => setActiveTab('cover-letter')}
              title="Cover Letter Builder"
            >
              <span className="tab-icon">✉️</span>
              <span className="tab-label">Cover Letter</span>
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'ats-checker' ? 'active' : ''}`} 
              onClick={() => setActiveTab('ats-checker')}
              title="ATS Score Checker"
            >
              <span className="tab-icon">📊</span>
              <span className="tab-label">ATS Score</span>
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'portfolio' ? 'active' : ''}`} 
              onClick={() => setActiveTab('portfolio')}
              title="Portfolio Converter"
            >
              <span className="tab-icon">🌐</span>
              <span className="tab-label">Portfolio</span>
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'interview' ? 'active' : ''}`} 
              onClick={() => setActiveTab('interview')}
              title="AI Interview Prep"
            >
              <span className="tab-icon">💬</span>
              <span className="tab-label">Interview</span>
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'job-tracker' ? 'active' : ''}`} 
              onClick={() => setActiveTab('job-tracker')}
              title="Job Tracker Dashboard"
            >
              <span className="tab-icon">📋</span>
              <span className="tab-label">Tracker</span>
            </button>
            <button 
              className={`sidebar-tab ${activeTab === 'offer-comparison' ? 'active' : ''}`} 
              onClick={() => setActiveTab('offer-comparison')}
              title="Offer Letter Comparison"
            >
              <span className="tab-icon">⚖️</span>
              <span className="tab-label">Offers</span>
            </button>

            {/* API Settings Gear at bottom */}
            <div className="sidebar-footer">
              <button 
                className="sidebar-tab settings-tab" 
                onClick={() => setShowSettingsModal(true)}
                title="AI Settings"
              >
                <span className="tab-icon">⚙️</span>
                <span className="tab-label">Settings</span>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE CONTENT */}
          <div className="workspace-content">
            {activeTab === 'editor' && (
              <main className="editor-right full-canvas">
                <PreviewPanel printRef={printRef} zoom={zoom} />
              </main>
            )}
            {activeTab === 'cover-letter' && <CoverLetterWorkspace />}
            {activeTab === 'ats-checker' && <ATSCheckerWorkspace />}
            {activeTab === 'portfolio' && <PortfolioWorkspace />}
            {activeTab === 'interview' && <InterviewWorkspace />}
            {activeTab === 'job-tracker' && <JobTrackerWorkspace />}
            {activeTab === 'offer-comparison' && <OfferComparisonWorkspace />}
          </div>
        </div>
      </div>

      {showSettingsModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <div className="settings-modal-header">
              <h3>AI Settings</h3>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <div className="form-group">
                <label htmlFor="gemini-key-input">Gemini API Key</label>
                <input
                  id="gemini-key-input"
                  type="password"
                  placeholder="Enter your Gemini API key (e.g. AIzaSy...)"
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value)
                    localStorage.setItem('gemini_api_key', e.target.value)
                  }}
                />
                <small className="help-text">
                  Your key is saved locally in your browser and sent only to the backend to generate questions & cover letters. If left blank, a smart local mock simulator will be used.
                </small>
              </div>
            </div>
            <div className="settings-modal-footer">
              <button className="btn-primary" onClick={() => setShowSettingsModal(false)}>Save & Close</button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
}

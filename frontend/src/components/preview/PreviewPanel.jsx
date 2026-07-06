import { useEffect, useRef, useState } from 'react'
import useResumeStore from '../../store/resumeStore'
import ExecutiveNavyTemplate from './ExecutiveNavyTemplate'
import FloatingToolbar from '../canvas/FloatingToolbar'
import '../../styles/executive-navy.css'

export default function PreviewPanel({ printRef }) {
  const { resume } = useResumeStore()
  const scrollRef = useRef(null)
  const [scale, setScale] = useState(0.8)
  const [spacers, setSpacers] = useState({})
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [previewReady, setPreviewReady] = useState(false)
  const [layoutCalculated, setLayoutCalculated] = useState(false)

  // Handle auto scaling on resize
  useEffect(() => {
    if (!resume) return

    const handleResize = () => {
      if (scrollRef.current) {
        // available width inside preview-scroll (accounting for padding and toolbar width)
        const scrollWidth = scrollRef.current.clientWidth - 120
        // A4 page width is 794px
        const computedScale = Math.max(Math.min(scrollWidth / 794, 1.2), 0.4)
        setScale(computedScale)
      }
    }

    window.addEventListener('resize', handleResize)
    // Run after DOM rendering yields
    const timer = setTimeout(handleResize, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [resume])

  const [contentHeight, setContentHeight] = useState(2246)

  // Observe master continuous element height changes
  useEffect(() => {
    if (!resume || !printRef.current) return

    const resumeEl = printRef.current.querySelector('.en-resume')
    if (!resumeEl) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContentHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(resumeEl)
    return () => resizeObserver.disconnect()
  }, [resume, printRef])

  // Font loading sync to prevent partial layout rendering flashes
  const resumeId = resume?.id
  useEffect(() => {
    if (!resumeId) return
    setPreviewReady(false)
    setLayoutCalculated(false)
    document.fonts.ready.then(() => {
      const timer = setTimeout(() => {
        setPreviewReady(true)
      }, 150)
      return () => clearTimeout(timer)
    })
  }, [resumeId])

  if (!resume) return null

  const isReady = previewReady && layoutCalculated

  const pageHeight = 1051 // CONTENT_H_PX (1123 - 36*2)
  const numPages = Math.max(Math.ceil(contentHeight / pageHeight), 1)
  const totalUnscaledHeight = numPages * pageHeight
  const scaledWidth = 794 * scale

  // Clamp current page index if pages list shrinks
  const activePageIdx = Math.min(currentPageIdx, numPages - 1)

  // Generate page numbers
  const pageNumbers = []
  for (let i = 0; i < numPages; i++) {
    pageNumbers.push({
      page: i + 1,
      topVal: (i + 1) * pageHeight - 25,
    })
  }

  return (
    <div className="preview-panel">
      <div className="preview-scroll" ref={scrollRef}>
        <div 
          className="preview-paper-wrapper" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            padding: '12px 0 24px', // Reduced top padding to position closer to toolbar
            alignItems: 'center',
            width: '100%',
            position: 'relative'
          }}
        >
          <FloatingToolbar />

          {/* Premium layout loading screen that takes exact page space to eliminate shifts */}
          {!isReady && (
            <div 
              className="preview-panel-loader" 
              style={{ 
                width: `${scaledWidth}px`, 
                height: `${1123 * scale}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                borderRadius: '4px',
                zIndex: 10,
                position: 'absolute',
                top: '50px'
              }}
            >
              <div className="preview-spinner"></div>
              <span style={{ marginTop: '16px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                Preparing document layout…
              </span>
            </div>
          )}

          {/* Sticky/Header Pagination Bar */}
          {isReady && numPages > 1 && (
            <div className="preview-pagination-bar">
              <button 
                className="pagination-btn"
                disabled={activePageIdx === 0}
                onClick={() => setCurrentPageIdx(activePageIdx - 1)}
                title="Previous Page"
              >
                ◀ Prev
              </button>
              <span className="pagination-text">
                Page <strong>{activePageIdx + 1}</strong> of <strong>{numPages}</strong>
              </span>
              <button 
                className="pagination-btn"
                disabled={activePageIdx === numPages - 1}
                onClick={() => setCurrentPageIdx(activePageIdx + 1)}
                title="Next Page"
              >
                Next ▶
              </button>
            </div>
          )}
          
          {/* Scaled wrapper to reserve layout space */}
          <div
            className="preview-page-sheet-wrapper"
            style={{
              width: `${scaledWidth}px`,
              height: `${1123 * scale}px`,
              position: 'relative',
              flexShrink: 0,
              opacity: isReady ? 1 : 0,
              visibility: isReady ? 'visible' : 'hidden',
              transition: 'opacity 0.3s ease'
            }}
          >
            {/* Unscaled sheet container (794 x 1123) scaled via transform */}
            <div 
              className="preview-page-sheet-container"
              style={{
                width: '794px',
                height: '1123px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                background: '#ffffff',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                borderRadius: '4px',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
            >
              {/* Viewport content area with top and bottom margins (unscaled) */}
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  left: 0,
                  width: '794px',
                  height: '1051px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: '794px',
                    height: `${totalUnscaledHeight}px`,
                    transform: `translate3d(0, ${-activePageIdx * 1051}px, 0)`,
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                  <ExecutiveNavyTemplate data={resume.data} spacers={spacers} />
                </div>
              </div>

              {/* Page Number (positioned relative to bottom-right of page sheet in unscaled pixels) */}
              <div
                className="preview-page-number"
                style={{
                  position: 'absolute',
                  right: '28px',
                  bottom: '20px',
                  fontSize: '8.5px',
                  color: '#64748b',
                  fontWeight: 500,
                  zIndex: 90,
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Page {activePageIdx + 1} of {numPages}
              </div>
            </div>
          </div>

          {/* Hidden continuous element specifically for PDF generation/capture.
              This must ALWAYS remain rendered in the DOM to run layout measurements. */}
          <div 
            ref={printRef}
            className="print-only-continuous"
            style={{
              position: 'fixed',
              top: '-9999px',
              left: '-9999px',
              width: '794px',
              height: 'auto',
              background: '#ffffff',
              zIndex: -9999
            }}
          >
            <ExecutiveNavyTemplate 
              data={resume.data} 
              spacers={spacers} 
              setSpacers={setSpacers} 
              isMaster 
              onLayoutCalculated={() => setLayoutCalculated(true)} 
            />
            
            {/* Draw page numbers on print-only continuous element so they end up in the PDF */}
            {pageNumbers.map(({ page, topVal }) => (
              <div
                key={page}
                style={{ 
                  position: 'absolute',
                  right: '28px',
                  top: `${topVal}px`,
                  fontSize: '8.5px',
                  color: '#64748b',
                  fontWeight: 500,
                  zIndex: 90,
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Page {page} of {numPages}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

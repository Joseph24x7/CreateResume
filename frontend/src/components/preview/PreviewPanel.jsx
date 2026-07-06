import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useResumeStore from '../../store/resumeStore'
import ExecutiveNavyTemplate from './ExecutiveNavyTemplate'
import FloatingToolbar from '../canvas/FloatingToolbar'
import '../../styles/executive-navy.css'

const PAGE_H = 1051   // A4 content height in px (1123 - 36*2 margins)
const PAGE_W = 794    // A4 width in px

export default function PreviewPanel({ printRef, zoom = 1 }) {
  const { resume } = useResumeStore()
  const scrollRef = useRef(null)

  const [baseScale, setBaseScale] = useState(0.8)
  const [spacers, setSpacers] = useState({})
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [previewReady, setPreviewReady] = useState(false)
  const [layoutCalculated, setLayoutCalculated] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)

  // Guard: onLayoutCalculated fires only ONCE per resumeId load
  const layoutCalledRef = useRef(false)

  // Stable memoized callbacks to avoid re-triggering master's useLayoutEffect
  const stableSetSpacers = useCallback((s) => setSpacers(s), [])

  const stableOnLayoutCalculated = useCallback(() => {
    if (!layoutCalledRef.current) {
      layoutCalledRef.current = true
      setLayoutCalculated(true)
    }
  }, [])

  // Compute final scale: base scale × user zoom factor
  const scale = useMemo(() => baseScale * zoom, [baseScale, zoom])
  const scaledWidth = PAGE_W * scale
  const scaledHeight = 1123 * scale

  // Computed page layout values
  const numPages = useMemo(() => {
    if (contentHeight <= 0) return 1
    const PAGE_1_H = 1087
    const PAGE_N_H = 1051
    if (contentHeight <= PAGE_1_H) return 1
    return 1 + Math.ceil((contentHeight - PAGE_1_H) / PAGE_N_H)
  }, [contentHeight])

  const totalUnscaledHeight = useMemo(() => {
    const PAGE_1_H = 1087
    const PAGE_N_H = 1051
    return PAGE_1_H + (numPages - 1) * PAGE_N_H
  }, [numPages])

  const activePageIdx = Math.min(currentPageIdx, numPages - 1)

  const pageNumbers = useMemo(() => {
    const arr = []
    const PAGE_1_H = 1087
    const PAGE_N_H = 1051
    for (let i = 0; i < numPages; i++) {
      const bottomOfPage = i === 0 ? PAGE_1_H : PAGE_1_H + i * PAGE_N_H
      arr.push({ page: i + 1, topVal: bottomOfPage - 25 })
    }
    return arr
  }, [numPages])


  // ── Scale on window resize ───────────────────────────────────────────────
  // Uses useLayoutEffect so scale is correct before first paint (no setTimeout flicker)
  useLayoutEffect(() => {
    const compute = () => {
      if (scrollRef.current) {
        const available = scrollRef.current.clientWidth - 80
        setBaseScale(Math.max(Math.min(available / PAGE_W, 1.2), 0.4))
      }
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, []) // runs once; resume change doesn't affect viewport width

  // ── ResizeObserver: track master content height ──────────────────────────
  useEffect(() => {
    if (!printRef.current) return
    const resumeEl = printRef.current.querySelector('.en-resume')
    if (!resumeEl) return

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height)
      }
    })
    ro.observe(resumeEl)
    return () => ro.disconnect()
  }, [printRef]) // printRef.current is stable after mount

  // ── Font loading gate — one timer with proper cleanup ────────────────────
  const resumeId = resume?.id
  useEffect(() => {
    if (!resumeId) return

    // Reset all readiness flags for this new resume
    setPreviewReady(false)
    setLayoutCalculated(false)
    setCurrentPageIdx(0)
    layoutCalledRef.current = false

    let timer
    const onFontsReady = () => {
      // Extra 100ms ensures any remaining CSS reflow settles
      timer = setTimeout(() => setPreviewReady(true), 100)
    }

    document.fonts.ready.then(onFontsReady)

    // Proper cleanup: cancels timer if component unmounts or resumeId changes
    return () => clearTimeout(timer)
  }, [resumeId])

  if (!resume) return null

  const isReady = previewReady && layoutCalculated && contentHeight > 0

  return (
    <div className="preview-panel" style={{ position: 'relative' }}>
      <FloatingToolbar />
      <div className="preview-scroll" ref={scrollRef}>
        <div className="preview-paper-wrapper">


          {/* Pagination bar — always reserve its space to avoid layout shift */}

          <div
            className="preview-pagination-bar"
            style={{ visibility: isReady && numPages > 1 ? 'visible' : 'hidden' }}
          >
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

          {/* Page card slot — always reserves exact space to eliminate layout shift */}
          <div
            className="preview-page-sheet-wrapper"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Skeleton shimmer shown while loading */}
            {!isReady && (
              <div
                className="preview-page-skeleton"
                style={{ width: '100%', height: '100%' }}
              />
            )}

            {/* Live page — fades in once fully ready */}
            <div
              className="preview-page-sheet-container"
              style={{
                width: `${PAGE_W}px`,
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
                boxSizing: 'border-box',
                opacity: isReady ? 1 : 0,
                transition: 'opacity 0.35s ease',
              }}
            >
              {/* Viewport: clips to one A4 content page */}
              <div
                style={{
                  position: 'absolute',
                  top: activePageIdx === 0 ? 0 : '36px',
                  left: 0,
                  width: `${PAGE_W}px`,
                  height: activePageIdx === 0 ? '1087px' : `${PAGE_H}px`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${PAGE_W}px`,
                    height: `${totalUnscaledHeight}px`,
                    transform: `translate3d(0, ${-(activePageIdx === 0 ? 0 : 1087 + (activePageIdx - 1) * PAGE_H)}px, 0)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >

                  <ExecutiveNavyTemplate data={resume.data} spacers={spacers} />
                </div>
              </div>

              {/* Page number badge */}
              <div
                className="preview-page-number"
                style={{
                  position: 'absolute',
                  right: '28px',
                  bottom: '20px',
                  fontSize: '8.5px',
                  color: '#94a3b8',
                  fontWeight: 500,
                  zIndex: 90,
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Page {activePageIdx + 1} of {numPages}
              </div>
            </div>
          </div>

          {/* ── PDF capture master — renders offscreen WITH spacers applied ── */}
          <div
            ref={printRef}
            className="print-only-continuous"
            style={{
              position: 'fixed',
              top: '-9999px',
              left: '-9999px',
              width: `${PAGE_W}px`,
              height: 'auto',
              background: '#ffffff',
              zIndex: -9999,
            }}
          >

            <ExecutiveNavyTemplate
              data={resume.data}
              spacers={spacers}
              isMaster={false}
            />

            {/* Page number overlays for PDF capture */}
            {pageNumbers.map(({ page, topVal }) => (
              <div
                key={page}
                style={{
                  position: 'absolute',
                  right: '28px',
                  top: `${topVal}px`,
                  fontSize: '8.5px',
                  color: '#94a3b8',
                  fontWeight: 500,
                  zIndex: 90,
                  pointerEvents: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Page {page} of {numPages}
              </div>
            ))}
          </div>

          {/* ── Layout measurement master — ALWAYS rendered offscreen WITHOUT spacers ── */}
          <div
            className="layout-measurement-master"
            style={{
              position: 'fixed',
              top: '-9999px',
              left: '-9999px',
              width: `${PAGE_W}px`,
              height: 'auto',
              background: '#ffffff',
              zIndex: -9999,
            }}
          >
            <ExecutiveNavyTemplate
              data={resume.data}
              spacers={{}}
              setSpacers={stableSetSpacers}
              isMaster={true}
              onLayoutCalculated={stableOnLayoutCalculated}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

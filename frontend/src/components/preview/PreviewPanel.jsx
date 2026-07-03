import { useEffect, useRef, useState } from 'react'
import useResumeStore from '../../store/resumeStore'
import ExecutiveNavyTemplate from './ExecutiveNavyTemplate'
import FloatingToolbar from '../canvas/FloatingToolbar'
import '../../styles/executive-navy.css'

export default function PreviewPanel({ printRef }) {
  const { resume } = useResumeStore()
  const scrollRef = useRef(null)
  const [scale, setScale] = useState(0.8)

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

  if (!resume) return null

  // Page 1 (1123px) + Gap (40px) + Page 2 (1123px) = 2286px
  const totalUnscaledHeight = 2286
  const scaledWidth = 794 * scale
  const scaledHeight = totalUnscaledHeight * scale

  return (
    <div className="preview-panel">
      <div className="preview-scroll" ref={scrollRef}>
        <div className="preview-paper-wrapper" style={{ minHeight: `${scaledHeight + 48}px` }}>
          <FloatingToolbar />
          
          <div 
            className="preview-paper-scaler" 
            style={{ 
              width: `${scaledWidth}px`, 
              height: `${scaledHeight}px`,
              position: 'relative'
            }}
          >
            <div 
              className="preview-paper" 
              ref={printRef}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: '794px',
                height: `${totalUnscaledHeight}px`,
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <ExecutiveNavyTemplate data={resume.data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

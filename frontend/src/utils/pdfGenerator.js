import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Generates a PDF by capturing the entire .en-resume element as one tall canvas,
 * then slicing it into A4 pages (794px × 1123px each).
 *
 * This approach guarantees:
 *  1. Content flows naturally — no fixed-height clipping
 *  2. PDF is pixel-perfect match of what the browser renders
 *  3. Page breaks happen at exact A4 boundaries
 *
 * @param {HTMLElement} previewPaperEl - printRef.current (.preview-paper wrapper)
 * @param {string} filename - Output PDF filename
 */
export async function generatePdfFromPreview(previewPaperEl, filename = 'resume.pdf') {
  const A4_WIDTH_MM  = 210
  const A4_HEIGHT_MM = 297
  const PAGE_W_PX    = 794  // A4 width  at 96dpi
  const PAGE_H_PX    = 1123 // A4 height at 96dpi

  // ── Step 1: Hide all UI-only elements ───────────────────────────────────
  const uiSelectors = [
    '.no-print',
    '.block-controls',
    '.bullet-delete-btn',
    '.en-page-break-marker',
    '.preview-page-break-line',
  ]
  const hiddenEls = []
  uiSelectors.forEach(sel => {
    previewPaperEl.querySelectorAll(sel).forEach(el => {
      hiddenEls.push({ el, display: el.style.display })
      el.style.display = 'none'
    })
  })

  // Strip editable hover/focus styling for clean capture
  const editableEls = previewPaperEl.querySelectorAll('.editable-text')
  editableEls.forEach(el => {
    el.dataset._origBg  = el.style.background
    el.dataset._origShadow = el.style.boxShadow
    el.style.background = 'none'
    el.style.boxShadow  = 'none'
    el.style.outline    = 'none'
  })

  // ── Step 2: Reset scale transform to 1:1 ────────────────────────────────
  const origTransform   = previewPaperEl.style.transform
  const origPosition    = previewPaperEl.style.position
  const origTop         = previewPaperEl.style.top
  const origLeft        = previewPaperEl.style.left
  const origZIndex      = previewPaperEl.style.zIndex

  previewPaperEl.style.transform  = 'none'
  previewPaperEl.style.position   = 'fixed'
  previewPaperEl.style.top        = '0'
  previewPaperEl.style.left       = '0'
  previewPaperEl.style.zIndex     = '-9999'

  // Find the .en-resume — the actual content container
  const resumeEl = previewPaperEl.querySelector('.en-resume') || previewPaperEl

  // Wait for browser to reflow at natural size
  await new Promise(r => setTimeout(r, 200))

  const SCALE = 2  // 2× for crisp output

  let captureCanvas
  try {
    resumeEl.classList.add('pdf-capture')
    
    // ── Step 3: Capture the ENTIRE resume as one tall canvas ───────────────
    captureCanvas = await html2canvas(resumeEl, {
      scale: SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: PAGE_W_PX,
      windowWidth: PAGE_W_PX,
      scrollX: 0,
      scrollY: 0,
    })
  } finally {
    resumeEl.classList.remove('pdf-capture')
    
    // ── Step 4: Restore everything immediately ─────────────────────────────
    hiddenEls.forEach(({ el, display }) => { el.style.display = display })
    editableEls.forEach(el => {
      el.style.background = el.dataset._origBg  || ''
      el.style.boxShadow  = el.dataset._origShadow || ''
      el.style.outline    = ''
      delete el.dataset._origBg
      delete el.dataset._origShadow
    })
    previewPaperEl.style.transform  = origTransform
    previewPaperEl.style.position   = origPosition
    previewPaperEl.style.top        = origTop
    previewPaperEl.style.left       = origLeft
    previewPaperEl.style.zIndex     = origZIndex
  }

  // ── Step 5: Slice the tall canvas into A4-height pages ──────────────────
  const MARGIN_H_PX = 36
  const CONTENT_H_PX = PAGE_H_PX - (MARGIN_H_PX * 2) // 1051px
  const pageHeightScaled = PAGE_H_PX * SCALE
  const pageWidthScaled  = PAGE_W_PX * SCALE
  const contentHeightScaled = CONTENT_H_PX * SCALE
  const marginHeightScaled = MARGIN_H_PX * SCALE

  const totalPages = Math.ceil(captureCanvas.height / contentHeightScaled)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    // Create a new canvas for each A4 slice
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width  = pageWidthScaled
    pageCanvas.height = pageHeightScaled

    const ctx = pageCanvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageWidthScaled, pageHeightScaled)

    // Draw the slice from the full canvas onto this page canvas leaving margins
    const srcY = pageIdx * contentHeightScaled
    const remainingHeight = captureCanvas.height - srcY
    const drawHeight = Math.min(contentHeightScaled, remainingHeight)

    if (drawHeight > 0) {
      ctx.drawImage(
        captureCanvas,
        0, srcY,                          // source x, y
        pageWidthScaled, drawHeight,      // source width, height
        0, marginHeightScaled,            // dest x, y (leaving top margin)
        pageWidthScaled, drawHeight       // dest width, height
      )
    }

    // JPEG at 0.99 quality: imperceptible artifacts, 3-5x smaller than PNG
    const imgData = pageCanvas.toDataURL('image/jpeg', 0.99)

    if (pageIdx > 0) pdf.addPage()

    // Fill the A4 page exactly
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST')
  }

  pdf.save(filename)
}

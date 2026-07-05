import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Generates a PDF by capturing the actual rendered preview DOM pages.
 * Guarantees pixel-perfect match: hides all UI-only elements, resets
 * the preview scale to 1:1 during capture, then restores everything.
 *
 * @param {HTMLElement} previewPaperEl - The .preview-paper element (printRef.current)
 * @param {string} filename - Output PDF filename
 */
export async function generatePdfFromPreview(previewPaperEl, filename = 'resume.pdf') {
  const A4_WIDTH_MM = 210
  const A4_HEIGHT_MM = 297
  const PAGE_W = 794
  const PAGE_H = 1123

  // ── Step 1: Hide all UI-only elements ──────────────────────────────────
  // These elements exist for editing UX but must not appear in the PDF.
  const uiSelectors = [
    '.no-print',
    '.block-controls',
    '.page-break-gap',
    '.floating-toolbar',
    '.bullet-delete-btn',
  ]
  const hiddenEls = []
  uiSelectors.forEach(sel => {
    previewPaperEl.querySelectorAll(sel).forEach(el => {
      hiddenEls.push({ el, display: el.style.display })
      el.style.display = 'none'
    })
  })

  // Also strip editable hover/focus styling so text looks clean
  const editableEls = previewPaperEl.querySelectorAll('.editable-text')
  editableEls.forEach(el => {
    el.style.background = 'none'
    el.style.boxShadow = 'none'
    el.style.outline = 'none'
  })

  // ── Step 2: Reset scale transform to 1:1 ──────────────────────────────
  const origTransform = previewPaperEl.style.transform
  const origWidth = previewPaperEl.style.width
  const origHeight = previewPaperEl.style.height
  const origPosition = previewPaperEl.style.position
  const origTop = previewPaperEl.style.top
  const origLeft = previewPaperEl.style.left

  previewPaperEl.style.transform = 'none'
  previewPaperEl.style.width = `${PAGE_W}px`
  previewPaperEl.style.height = 'auto'
  previewPaperEl.style.position = 'fixed'
  previewPaperEl.style.top = '0'
  previewPaperEl.style.left = '0'

  // Wait for browser to reflow/repaint at the new size
  await new Promise(r => setTimeout(r, 150))

  // ── Step 3: Capture each page ──────────────────────────────────────────
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  try {
    const pages = previewPaperEl.querySelectorAll('.en-page')

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]

      const canvas = await html2canvas(page, {
        scale: 2,           // 2× for sharp output
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: PAGE_W,
        height: PAGE_H,
        scrollX: 0,
        scrollY: 0,
        windowWidth: PAGE_W,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      if (i > 0) pdf.addPage()

      // Fill A4 page exactly
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST')
    }

    pdf.save(filename)
  } finally {
    // ── Step 4: Restore everything ─────────────────────────────────────
    hiddenEls.forEach(({ el, display }) => {
      el.style.display = display
    })
    editableEls.forEach(el => {
      el.style.background = ''
      el.style.boxShadow = ''
      el.style.outline = ''
    })

    previewPaperEl.style.transform = origTransform
    previewPaperEl.style.width = origWidth
    previewPaperEl.style.height = origHeight
    previewPaperEl.style.position = origPosition
    previewPaperEl.style.top = origTop
    previewPaperEl.style.left = origLeft
  }
}

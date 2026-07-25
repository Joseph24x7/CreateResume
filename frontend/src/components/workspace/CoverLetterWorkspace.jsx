import { useState } from 'react'
import useResumeStore from '../../store/resumeStore'
import { formatResumeToText } from '../../utils/resumeFormatter'

export default function CoverLetterWorkspace() {
  const resume = useResumeStore((s) => s.resume)
  const [jobTitle, setJobTitle] = useState(resume?.data?.personalInfo?.title || '')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setCopied(false)
    try {
      const resumeText = formatResumeToText(resume)
      const geminiKey = localStorage.getItem('gemini_api_key') || ''

      const res = await fetch('http://localhost:8080/api/v1/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-Key': geminiKey,
        },
        body: JSON.stringify({
          resumeText,
          jobTitle,
          company,
          jobDescription,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCoverLetter(data.coverLetter || '')
      } else {
        alert('Failed to generate cover letter.')
      }
    } catch (err) {
      console.error(err)
      alert('Error connecting to AI service.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    if (!coverLetter) return
    setPdfLoading(true)
    try {
      const pi = resume?.data?.personalInfo || {}
      const candidateName = `${pi.firstName || ''} ${pi.lastName || ''}`.trim() || 'Applicant'
      const candidateTitle = pi.title || jobTitle || 'Professional'
      const email = pi.email || ''
      const phone = pi.phone || ''
      const location = pi.location || ''
      const linkedin = pi.linkedin || ''

      const today = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      const contactItems = [email, phone, location, linkedin].filter(Boolean).join('  •  ')

      const singlePageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4 portrait; margin: 0 !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #ffffff; font-family: 'Georgia', 'Merriweather', serif; color: #1e293b; }
    .page-container {
      width: 794px;
      height: 1123px;
      padding: 56px 64px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: #ffffff;
    }
    .header-name {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 4px 0;
    }
    .header-title {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 16px 0;
    }
    .contact-bar {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #475569;
      padding-bottom: 16px;
      border-bottom: 2px solid #0284c7;
      margin-bottom: 28px;
    }
    .meta-date {
      font-size: 12px;
      color: #475569;
      margin-bottom: 20px;
    }
    .recipient-info {
      font-size: 13px;
      color: #1e293b;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .subject-line {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
    }
    .letter-content {
      font-size: 13px;
      line-height: 1.7;
      color: #334155;
      white-space: pre-wrap;
      flex-grow: 1;
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <h1 class="header-name">${candidateName}</h1>
    <div class="header-title">${candidateTitle}</div>
    <div class="contact-bar">${contactItems}</div>

    <div class="meta-date">${today}</div>

    <div class="recipient-info">
      <strong>Hiring Manager</strong><br/>
      ${company || 'Target Organization'}
    </div>

    <div class="subject-line">Re: Application for ${jobTitle || 'Position'}</div>

    <div class="letter-content">${coverLetter}</div>
  </div>
</body>
</html>`

      const res = await fetch('http://localhost:8080/api/v1/resumes/export-pdf-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: singlePageHtml,
          filename: `${(company || 'Cover_Letter').replace(/\s+/g, '_')}_Cover_Letter`,
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(company || 'Cover_Letter').replace(/[^a-zA-Z0-9\-_]/g, '_')}_Cover_Letter.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        alert('Failed to generate PDF.')
      }
    } catch (err) {
      console.error(err)
      alert('Error exporting PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="workspace-container">
      <style>{`
        .workspace-container {
          padding: 32px;
          color: #f8fafc;
          overflow-y: auto;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          gap: 32px;
        }
        .ws-panel-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
        }
        .ws-panel-right {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
          min-height: 400px;
        }
        .ws-title {
          font-size: 20px;
          font-weight: 600;
          color: #f8fafc;
          margin: 0 0 4px 0;
        }
        .ws-desc {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 16px 0;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
        }
        .form-group input, .form-group textarea {
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: #0284c7;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 110px;
          font-family: inherit;
        }
        .help-text {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
        }
        .btn-ws {
          background: #0284c7;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-ws:hover:not(:disabled) {
          background: #0369a1;
        }
        .btn-ws:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .letter-actions {
          margin-top: auto;
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #334155;
        }
        .btn-sec {
          background: #334155;
          color: #f8fafc;
          border: 1px solid #475569;
        }
        .btn-sec:hover {
          background: #475569;
        }
        .letter-display {
          flex-grow: 1;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 16px;
          color: #cbd5e1;
          font-family: 'Lora', Georgia, serif;
          font-size: 14px;
          line-height: 1.6;
          outline: none;
          white-space: pre-wrap;
          overflow-y: auto;
        }
        .letter-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
          gap: 12px;
        }
        .letter-empty-icon {
          font-size: 48px;
        }
      `}</style>

      <div className="ws-panel-left">
        <div>
          <h3 className="ws-title">Cover Letter Builder</h3>
          <p className="ws-desc">
            Tailor a professional cover letter using your active resume highlights.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="job-title-cl">Job Title *</label>
          <input
            id="job-title-cl"
            type="text"
            placeholder="e.g. Senior Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="company-cl">Company Name *</label>
          <input
            id="company-cl"
            type="text"
            placeholder="e.g. Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="desc-cl">Job Description / Requirements (Optional)</label>
          <textarea
            id="desc-cl"
            placeholder="Paste job posting requirements here to tailor specific skills in your letter..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <small className="help-text">
            Optional: If provided, key requirements will be addressed in the letter. If left blank, we generate a letter based on Job Title & Company Name.
          </small>
        </div>

        <button
          className="btn-ws"
          onClick={handleGenerate}
          disabled={loading || !jobTitle.trim() || !company.trim()}
        >
          {loading ? 'Generating tailored letter...' : 'Generate Tailored Cover Letter ✦'}
        </button>
      </div>

      <div className="ws-panel-right">
        {coverLetter ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#cbd5e1' }}>
                Tailored Cover Letter
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Editable text below</span>
            </div>
            <textarea
              className="letter-display"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="letter-actions">
              <button className="btn-ws btn-sec" onClick={handleCopy}>
                {copied ? 'Copied! ✓' : 'Copy Text'}
              </button>
              <button
                className="btn-ws"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? 'Generating PDF...' : 'Download Single-Page PDF 📄'}
              </button>
            </div>
          </div>
        ) : (
          <div className="letter-empty">
            <span className="letter-empty-icon">✉️</span>
            <span>Your tailored cover letter will appear here once generated.</span>
          </div>
        )}
      </div>
    </div>
  )
}

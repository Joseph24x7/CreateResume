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

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([coverLetter], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${company.replace(/\s+/g, '_')}_Cover_Letter.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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
          min-height: 120px;
          font-family: inherit;
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
          <p className="ws-desc">Tailor a professional cover letter matching your resume highlights with the target job details.</p>
        </div>

        <div className="form-group">
          <label htmlFor="job-title-cl">Job Title</label>
          <input
            id="job-title-cl"
            type="text"
            placeholder="e.g. Senior Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="company-cl">Company Name</label>
          <input
            id="company-cl"
            type="text"
            placeholder="e.g. Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="desc-cl">Job Description / Requirements</label>
          <textarea
            id="desc-cl"
            placeholder="Paste the job description details here to tailor your cover letter..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button className="btn-ws" onClick={handleGenerate} disabled={loading || !jobTitle || !company}>
          {loading ? 'Generating tailored letter...' : 'Generate Tailored Cover Letter ✦'}
        </button>
      </div>

      <div className="ws-panel-right">
        {coverLetter ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#cbd5e1' }}>Tailored Cover Letter</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Editable below</span>
            </div>
            <textarea
              className="letter-display"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="letter-actions">
              <button className="btn-ws btn-sec" onClick={handleCopy}>
                {copied ? 'Copied! ✓' : 'Copy to Clipboard'}
              </button>
              <button className="btn-ws" onClick={handleDownload}>
                Download as Text File (.txt)
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

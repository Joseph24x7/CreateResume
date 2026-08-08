import { useState, useEffect } from 'react'
import useResumeStore from '../../store/resumeStore'
import { formatResumeToText } from '../../utils/resumeFormatter'
import EditableText from '../canvas/EditableText'

export default function CoverLetterWorkspace() {
  const resume = useResumeStore((s) => s.resume)
  const pi = resume?.data?.personalInfo || {}

  const defaultCandidateName = `${pi.firstName || ''} ${pi.lastName || ''}`.trim() || 'Alex Morgan'
  const defaultCandidateTitle = pi.title || 'Senior Software Engineer'
  const defaultEmail = pi.email || 'alex.morgan@example.com'
  const defaultPhone = pi.phone || '+1 (555) 234-5678'
  const defaultLocation = pi.location || 'San Francisco, CA'
  const defaultLinkedin = pi.linkedin || 'linkedin.com/in/alexmorgan'

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Target inputs
  const [jobTitle, setJobTitle] = useState(pi.title || 'Senior Software Engineer')
  const [company, setCompany] = useState('Acme Corporation')
  const [jobDescription, setJobDescription] = useState('')
  const [showDescInput, setShowDescInput] = useState(false)

  // Document state (WYSIWYG Editable)
  const [candidateName, setCandidateName] = useState(defaultCandidateName)
  const [candidateTitle, setCandidateTitle] = useState(defaultCandidateTitle)
  const [email, setEmail] = useState(defaultEmail)
  const [phone, setPhone] = useState(defaultPhone)
  const [location, setLocation] = useState(defaultLocation)
  const [linkedin, setLinkedin] = useState(defaultLinkedin)

  const [dateStr, setDateStr] = useState(todayFormatted)
  const [recipientName, setRecipientName] = useState('Hiring Manager')
  const [companyName, setCompanyName] = useState('Acme Corporation')
  const [companyAddress, setCompanyAddress] = useState('100 Innovation Way, San Francisco, CA 94105')
  const [subjectText, setSubjectText] = useState('Re: Application for Senior Software Engineer')

  const [salutation, setSalutation] = useState('Dear Hiring Manager,')
  const [coverLetter, setCoverLetter] = useState(
    `I am writing to express my strong enthusiasm for the Senior Software Engineer position at Acme Corporation. With over 7 years of hands-on experience designing high-throughput microservices, optimizing distributed databases, and leading agile engineering teams, I am confident in my ability to make an immediate, meaningful impact on your engineering operations.\n\nThroughout my career, I have consistently driven technical excellence and business results. In my recent role, I spearheaded the architectural migration from a legacy monolithic infrastructure to event-driven microservices using Spring Boot, Kafka, and Kubernetes. This transformation reduced application latency by 45% and enabled continuous deployment with zero downtime.\n\nWhat particularly draws me to Acme Corporation is your commitment to innovative product engineering and scalable technology solutions. I thrive in collaborative environments where complex technical challenges are solved with elegant, maintainable code.\n\nThank you for your time and consideration. I welcome the opportunity to discuss how my technical background and leadership skills align with Acme Corporation's goals.`
  )
  const [signOff, setSignOff] = useState('Sincerely,')

  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auto-sync candidate details when active resume changes
  useEffect(() => {
    if (pi.firstName || pi.lastName) {
      setCandidateName(`${pi.firstName || ''} ${pi.lastName || ''}`.trim())
    }
    if (pi.title) setCandidateTitle(pi.title)
    if (pi.email) setEmail(pi.email)
    if (pi.phone) setPhone(pi.phone)
    if (pi.location) setLocation(pi.location)
    if (pi.linkedin) setLinkedin(pi.linkedin)
  }, [pi.firstName, pi.lastName, pi.title, pi.email, pi.phone, pi.location, pi.linkedin])

  // Sync subject line when jobTitle changes
  const handleJobTitleChange = (val) => {
    setJobTitle(val)
    setSubjectText(`Re: Application for ${val || 'Position'}`)
  }

  // Sync company name when company input changes
  const handleCompanyChange = (val) => {
    setCompany(val)
    setCompanyName(val || 'Target Organization')
  }

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
        if (data.coverLetter) {
          setCoverLetter(data.coverLetter)
        }
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
    const fullText = `${candidateName}\n${candidateTitle}\n${email} | ${phone} | ${location}\n\n${dateStr}\n\n${recipientName}\n${companyName}\n${companyAddress}\n\n${subjectText}\n\n${salutation}\n\n${coverLetter}\n\n${signOff}\n${candidateName}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      const contactItems = [email, phone, location, linkedin].filter(Boolean).join('  •  ')

      const singlePageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4 portrait; margin: 0 !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #ffffff; font-family: 'Merriweather Sans', Arial, Helvetica, sans-serif; color: #1e293b; }
    .page-container {
      width: 794px;
      height: 1123px;
      padding: 54px 60px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: #ffffff;
    }
    .header-name {
      font-size: 26px;
      font-weight: 700;
      color: #1b2340;
      letter-spacing: -0.3px;
      margin: 0 0 4px 0;
      line-height: 1.15;
    }
    .header-title {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 0 0 16px 0;
    }
    .contact-bar {
      font-size: 10.5px;
      color: #334155;
      padding: 8px 12px;
      background: #f8fafc;
      border-top: 1px solid #d1d9e6;
      border-bottom: 1px solid #d1d9e6;
      margin-bottom: 24px;
    }
    .meta-date {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .recipient-info {
      font-size: 12.5px;
      color: #1e293b;
      margin-bottom: 20px;
      line-height: 1.45;
    }
    .recipient-name {
      font-weight: 700;
      color: #0f172a;
    }
    .subject-line {
      font-size: 13.5px;
      font-weight: 700;
      color: #1b2340;
      margin-bottom: 20px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #0ea5e9;
    }
    .salutation {
      font-size: 12.5px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 14px;
    }
    .letter-body {
      font-size: 11.5px;
      line-height: 1.65;
      color: #334155;
      white-space: pre-wrap;
      flex-grow: 1;
      text-align: justify;
    }
    .sign-off-block {
      margin-top: 24px;
      font-size: 12px;
      color: #1e293b;
      line-height: 1.5;
    }
    .sign-off-name {
      font-weight: 700;
      color: #0f172a;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <h1 class="header-name">${candidateName}</h1>
    <div class="header-title">${candidateTitle}</div>
    <div class="contact-bar">${contactItems}</div>

    <div class="meta-date">${dateStr}</div>

    <div class="recipient-info">
      <div class="recipient-name">${recipientName}</div>
      <div>${companyName}</div>
      <div>${companyAddress}</div>
    </div>

    <div class="subject-line">${subjectText}</div>
    <div class="salutation">${salutation}</div>

    <div class="letter-body">${coverLetter}</div>

    <div class="sign-off-block">
      <div>${signOff}</div>
      <div class="sign-off-name">${candidateName}</div>
    </div>
  </div>
</body>
</html>`

      const res = await fetch('http://localhost:8080/api/v1/resumes/export-pdf-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: singlePageHtml,
          filename: `${(companyName || 'Cover_Letter').replace(/\s+/g, '_')}_Cover_Letter`,
        }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(companyName || 'Cover_Letter').replace(/[^a-zA-Z0-9\-_]/g, '_')}_Cover_Letter.pdf`
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
    <div className="cl-workspace-wrapper">
      {/* ── TOP ACTION BAR ── */}
      <div className="cl-top-toolbar">
        <div className="cl-toolbar-left">
          <div className="cl-input-pill">
            <span className="cl-pill-label">Role:</span>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => handleJobTitleChange(e.target.value)}
              placeholder="Target Job Title"
            />
          </div>
          <div className="cl-input-pill">
            <span className="cl-pill-label">Company:</span>
            <input
              type="text"
              value={company}
              onChange={(e) => handleCompanyChange(e.target.value)}
              placeholder="Target Company"
            />
          </div>
          <button
            className="cl-btn-secondary"
            onClick={() => setShowDescInput(!showDescInput)}
            title="Toggle Job Description Input"
          >
            {showDescInput ? '▲ Hide Description' : '▼ Add Job Description'}
          </button>
        </div>

        <div className="cl-toolbar-right">
          <button
            className="cl-btn-ai"
            onClick={handleGenerate}
            disabled={loading || !jobTitle.trim() || !company.trim()}
          >
            {loading ? '⟳ Generating with AI...' : '✦ Generate with AI'}
          </button>
          <button className="cl-btn-secondary" onClick={handleCopy}>
            {copied ? 'Copied! ✓' : '📋 Copy Text'}
          </button>
          <button
            className="cl-btn-primary"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? '⟳ Exporting PDF...' : '↓ Download PDF'}
          </button>
        </div>
      </div>

      {/* ── COLLAPSIBLE JOB DESCRIPTION DRAWER ── */}
      {showDescInput && (
        <div className="cl-desc-drawer">
          <label htmlFor="cl-jd-text">Job Posting / Key Requirements (Optional AI Context)</label>
          <textarea
            id="cl-jd-text"
            rows="3"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job posting details here to tailor AI generation to specific skills and requirements..."
          />
        </div>
      )}

      {/* ── LIVE WYSIWYG CANVAS ── */}
      <div className="cl-canvas-container">
        <div className="cl-sheet-card">
          {/* CANDIDATE HEADER */}
          <div className="cl-header-block">
            <h1 className="cl-candidate-name">
              <EditableText
                value={candidateName}
                onChange={setCandidateName}
                placeholder="Your Full Name"
                singleLine
              />
            </h1>
            <div className="cl-candidate-title">
              <EditableText
                value={candidateTitle}
                onChange={setCandidateTitle}
                placeholder="Your Professional Title"
                singleLine
              />
            </div>
          </div>

          {/* CONTACT BAR */}
          <div className="cl-contact-bar">
            <EditableText value={email} onChange={setEmail} placeholder="Email" singleLine />
            <span className="cl-sep">•</span>
            <EditableText value={phone} onChange={setPhone} placeholder="Phone" singleLine />
            <span className="cl-sep">•</span>
            <EditableText value={location} onChange={setLocation} placeholder="Location" singleLine />
            <span className="cl-sep">•</span>
            <EditableText value={linkedin} onChange={setLinkedin} placeholder="LinkedIn" singleLine />
          </div>

          {/* DATE & RECIPIENT META */}
          <div className="cl-meta-block">
            <div className="cl-date">
              <EditableText value={dateStr} onChange={setDateStr} placeholder="Date" singleLine />
            </div>

            <div className="cl-recipient">
              <EditableText
                className="cl-recipient-name"
                value={recipientName}
                onChange={setRecipientName}
                placeholder="Hiring Manager Name / Title"
                singleLine
              />
              <EditableText
                value={companyName}
                onChange={setCompanyName}
                placeholder="Company Name"
                singleLine
              />
              <EditableText
                value={companyAddress}
                onChange={setCompanyAddress}
                placeholder="Company Location / Address"
                singleLine
              />
            </div>

            <div className="cl-subject">
              <EditableText
                value={subjectText}
                onChange={setSubjectText}
                placeholder="Subject Line"
                singleLine
              />
            </div>

            <div className="cl-salutation">
              <EditableText
                value={salutation}
                onChange={setSalutation}
                placeholder="Salutation (e.g. Dear Hiring Manager,)"
                singleLine
              />
            </div>
          </div>

          {/* EDITABLE LETTER BODY */}
          <div className="cl-body-block">
            <EditableText
              tagName="div"
              className="cl-body-text"
              value={coverLetter}
              onChange={setCoverLetter}
              placeholder="Click here to write or paste your cover letter paragraphs..."
            />
          </div>

          {/* CLOSING SIGN-OFF */}
          <div className="cl-signoff-block">
            <EditableText value={signOff} onChange={setSignOff} placeholder="Closing (e.g. Sincerely,)" singleLine />
            <div className="cl-signoff-name">
              <EditableText value={candidateName} onChange={setCandidateName} placeholder="Your Name" singleLine />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

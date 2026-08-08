import { useState, useEffect } from 'react'
import useResumeStore from '../../store/resumeStore'
import EditableText from '../canvas/EditableText'

const Icon = ({ type }) => {
  const icons = {
    email: (
      <svg className="cl-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    phone: (
      <svg className="cl-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    location: (
      <svg className="cl-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    linkedin: (
      <svg className="cl-svg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  }
  return <span className="cl-icon">{icons[type] || '•'}</span>
}

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

  // Candidate Contact Info state
  const [candidateName, setCandidateName] = useState(defaultCandidateName)
  const [candidateTitle, setCandidateTitle] = useState(defaultCandidateTitle)
  const [email, setEmail] = useState(defaultEmail)
  const [phone, setPhone] = useState(defaultPhone)
  const [location, setLocation] = useState(defaultLocation)
  const [linkedin, setLinkedin] = useState(defaultLinkedin)

  // Document state (Editable on sheet)
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

  const [pdfLoading, setPdfLoading] = useState(false)

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

  const hasContactItems = Boolean(email || phone || location || linkedin)

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      const contactItemsHtml = [
        email ? `<span>📧 ${email}</span>` : '',
        phone ? `<span>📞 ${phone}</span>` : '',
        location ? `<span>📍 ${location}</span>` : '',
        linkedin ? `<span>🔗 ${linkedin}</span>` : '',
      ].filter(Boolean).join('')

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
      min-height: 1123px;
      padding: 48px 56px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: #ffffff;
    }
    .cl-header {
      margin-bottom: 8px;
    }
    .header-name {
      font-size: 28px;
      font-weight: 700;
      color: #1b2340;
      letter-spacing: -0.3px;
      margin: 0 0 2px 0;
      line-height: 1.15;
    }
    .header-title {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 0;
    }
    .contact-bar {
      font-size: 10.5px;
      color: #2b2b2b;
      padding: 6px 14px;
      background: #f8fafc;
      border-top: 1px solid #d1d9e6;
      border-bottom: 1px solid #d1d9e6;
      margin-bottom: 14px;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .meta-date {
      font-size: 11px;
      color: #6c7382;
      margin-bottom: 10px;
      font-weight: 500;
    }
    .recipient-card {
      border-left: 3px solid #304d89;
      padding-left: 12px;
      margin-bottom: 12px;
    }
    .recipient-info {
      font-size: 12px;
      color: #1e293b;
      line-height: 1.4;
    }
    .recipient-name {
      font-weight: 700;
      color: #0f172a;
    }
    .subject-banner {
      font-size: 13px;
      font-weight: 700;
      color: #1b2340;
      margin-bottom: 12px;
      padding: 6px 12px;
      background: #f0f9ff;
      border-left: 3px solid #0284c7;
      border-radius: 0 4px 4px 0;
    }
    .salutation {
      font-size: 12.5px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .letter-body {
      font-size: 11.5px;
      line-height: 1.65;
      color: #334155;
      white-space: pre-wrap;
      text-align: justify;
    }
    .sign-off-block {
      margin-top: 20px;
      font-size: 12px;
      color: #1e293b;
      line-height: 1.45;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    .sign-off-name {
      font-weight: 700;
      color: #0f172a;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="cl-header">
      <h1 class="header-name">${candidateName}</h1>
      <div class="header-title">${candidateTitle}</div>
    </div>

    ${contactItemsHtml ? `<div class="contact-bar">${contactItemsHtml}</div>` : ''}

    <div class="meta-date">${dateStr}</div>

    <div class="recipient-card">
      <div class="recipient-info">
        <div class="recipient-name">${recipientName}</div>
        <div>${companyName}</div>
        <div>${companyAddress}</div>
      </div>
    </div>

    <div class="subject-banner">${subjectText}</div>
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
      {/* ── PREMIUM EXECUTIVE CONTROL PANEL ── */}
      <div className="cl-premium-control-panel">
        <div className="cl-control-grid">
          {/* Target Application Group */}
          <div className="cl-control-group">
            <span className="cl-group-title">🎯 TARGET APPLICATION</span>
            <div className="cl-input-field">
              <label htmlFor="cl-role-input">Role I am applying for</label>
              <input
                id="cl-role-input"
                type="text"
                value={jobTitle}
                onChange={(e) => handleJobTitleChange(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="cl-input-field">
              <label htmlFor="cl-company-input">Company I am applying to</label>
              <input
                id="cl-company-input"
                type="text"
                value={company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                placeholder="e.g. Acme Corporation"
              />
            </div>
          </div>

          {/* Your Information Group */}
          <div className="cl-control-group">
            <span className="cl-group-title">👤 YOUR DETAILS</span>
            <div className="cl-input-field">
              <label htmlFor="cl-name-input">Full Name</label>
              <input
                id="cl-name-input"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div className="cl-input-field">
              <label htmlFor="cl-title-input">Professional Title</label>
              <input
                id="cl-title-input"
                type="text"
                value={candidateTitle}
                onChange={(e) => setCandidateTitle(e.target.value)}
                placeholder="Professional Title"
              />
            </div>
          </div>

          {/* Contact Details Group */}
          <div className="cl-control-group">
            <span className="cl-group-title">📬 CONTACT INFO</span>
            <div className="cl-input-field">
              <label htmlFor="cl-email-input">Email</label>
              <input
                id="cl-email-input"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
              />
            </div>
            <div className="cl-input-field">
              <label htmlFor="cl-phone-input">Mobile</label>
              <input
                id="cl-phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile Number"
              />
            </div>
            <div className="cl-input-field">
              <label htmlFor="cl-location-input">City, State</label>
              <input
                id="cl-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div className="cl-input-field">
              <label htmlFor="cl-linkedin-input">LinkedIn (Optional)</label>
              <input
                id="cl-linkedin-input"
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn URL"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="cl-control-actions">
          <button
            className="cl-btn-primary-lg"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? '⟳ Exporting PDF...' : '↓ Download Cover Letter PDF'}
          </button>
        </div>
      </div>

      {/* ── LIVE WYSIWYG CANVAS ── */}
      <div className="cl-canvas-container">
        <div className="cl-sheet-card">
          {/* CANDIDATE HEADER */}
          <div className="cl-header-block">
            <h1 className="cl-candidate-name">
              {candidateName}
            </h1>
            <div className="cl-candidate-title">
              {candidateTitle}
            </div>
          </div>

          {/* CONTACT BAR (Formatted Display Sync'd with Control Panel Text Boxes) */}
          {hasContactItems && (
            <div className="cl-contact-bar">
              {email && (
                <div className="cl-contact-item">
                  <Icon type="email" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="cl-contact-item">
                  <Icon type="phone" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="cl-contact-item">
                  <Icon type="location" />
                  <span>{location}</span>
                </div>
              )}
              {linkedin && (
                <div className="cl-contact-item">
                  <Icon type="linkedin" />
                  <span>{linkedin}</span>
                </div>
              )}
            </div>
          )}

          {/* DATE & RECIPIENT META */}
          <div className="cl-meta-block">
            <div className="cl-date">
              <EditableText value={dateStr} onChange={setDateStr} placeholder="Date" singleLine />
            </div>

            <div className="cl-recipient-card">
              <div className="cl-recipient">
                <EditableText
                  className="cl-recipient-name"
                  value={recipientName}
                  onChange={setRecipientName}
                  placeholder="Hiring Manager Name / Title"
                  singleLine
                />
                <div>{companyName}</div>
                <EditableText
                  value={companyAddress}
                  onChange={setCompanyAddress}
                  placeholder="Company Location / Address"
                  singleLine
                />
              </div>
            </div>

            <div className="cl-subject-banner">
              {subjectText}
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
              {candidateName}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

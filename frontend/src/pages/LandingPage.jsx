import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResumeStore from '../store/resumeStore'
import CoverLetterWorkspace from '../components/workspace/CoverLetterWorkspace'
import ATSCheckerWorkspace from '../components/workspace/ATSCheckerWorkspace'
import JobTrackerWorkspace from '../components/workspace/JobTrackerWorkspace'
import '../styles/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { resumeList, loading, fetchResumeList, createResume, deleteResume, loadResume, resume, updatePersonalInfo } = useResumeStore()
  const [activeTab, setActiveTab] = useState('resumes')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsTab, setSettingsTab] = useState('profile') // 'profile' | 'ai'

  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')

  // Default Profile & Contact Info State
  const pi = resume?.data?.personalInfo || {}
  const [fullName, setFullName] = useState(() => localStorage.getItem('user_full_name') || `${pi.firstName || ''} ${pi.lastName || ''}`.trim() || '')
  const [title, setTitle] = useState(() => localStorage.getItem('user_title') || pi.title || '')
  const [email, setEmail] = useState(() => localStorage.getItem('user_email') || pi.email || '')
  const [phone, setPhone] = useState(() => localStorage.getItem('user_phone') || pi.phone || '')
  const [location, setLocation] = useState(() => localStorage.getItem('user_location') || pi.location || '')
  const [linkedin, setLinkedin] = useState(() => localStorage.getItem('user_linkedin') || pi.linkedin || '')

  useEffect(() => {
    fetchResumeList()
  }, [])

  // Automatically load the latest resume into active store state if available
  useEffect(() => {
    if (resumeList.length > 0 && !resume) {
      loadResume(resumeList[0].id)
    }
  }, [resumeList, resume, loadResume])

  // Sync profile inputs when active resume loads
  useEffect(() => {
    if (resume?.data?.personalInfo) {
      const info = resume.data.personalInfo
      const nameStr = `${info.firstName || ''} ${info.lastName || ''}`.trim()
      if (nameStr && !localStorage.getItem('user_full_name')) setFullName(nameStr)
      if (info.title && !localStorage.getItem('user_title')) setTitle(info.title)
      if (info.email && !localStorage.getItem('user_email')) setEmail(info.email)
      if (info.phone && !localStorage.getItem('user_phone')) setPhone(info.phone)
      if (info.location && !localStorage.getItem('user_location')) setLocation(info.location)
      if (info.linkedin && !localStorage.getItem('user_linkedin')) setLinkedin(info.linkedin)
    }
  }, [resume])

  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('user_full_name', fullName)
    localStorage.setItem('user_title', title)
    localStorage.setItem('user_email', email)
    localStorage.setItem('user_phone', phone)
    localStorage.setItem('user_location', location)
    localStorage.setItem('user_linkedin', linkedin)
    localStorage.setItem('gemini_api_key', geminiKey)

    // Also update active resume personalInfo if active
    if (resume) {
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      updatePersonalInfo({
        ...pi,
        firstName,
        lastName,
        title,
        email,
        phone,
        location,
        linkedin,
      })
    }

    setShowSettingsModal(false)
  }

  const handleCreate = async () => {
    if (creating) return
    setCreating(true)
    try {
      const id = await createResume(newTitle.trim() || 'Untitled Resume')
      navigate(`/editor/${id}`)
    } finally {
      setCreating(false)
      setShowInput(false)
      setNewTitle('')
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (window.confirm('Delete this resume?')) {
      await deleteResume(id)
    }
  }

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : ''

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo" onClick={() => setActiveTab('resumes')} style={{ cursor: 'pointer' }}>
          <span className="logo-mark">F</span>
          <span className="logo-text">Free Resume Creator</span>
        </div>

        {/* HOME PAGE NAVIGATION TABS */}
        <div className="landing-nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'resumes' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumes')}
          >
            <span className="tab-icon">📄</span>
            <span>Resumes</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'cover-letter' ? 'active' : ''}`}
            onClick={() => setActiveTab('cover-letter')}
          >
            <span className="tab-icon">✉️</span>
            <span>Cover Letter</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'ats-score' ? 'active' : ''}`}
            onClick={() => setActiveTab('ats-score')}
          >
            <span className="tab-icon">📊</span>
            <span>ATS Score</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'job-tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('job-tracker')}
          >
            <span className="tab-icon">📋</span>
            <span>Job Tracker</span>
          </button>
        </div>

        <div className="landing-nav-right">
          <button
            className="nav-settings-btn"
            onClick={() => setShowSettingsModal(true)}
            title="Profile & Settings"
          >
            👤 Profile & Settings
          </button>
        </div>
      </nav>

      {/* ACTIVE TAB CONTENT */}
      {activeTab === 'resumes' && (
        <>
          <header className="landing-hero">
            <div className="hero-badge">✦ Free Resume Creator</div>
            <h1 className="hero-title">
              Craft Resumes That<br />
              <span className="hero-gradient">Get You Hired</span>
            </h1>
            <p className="hero-sub">
              Professional templates · Live preview · ATS optimised · One-click PDF export
            </p>
            <div className="hero-actions">
              {showInput ? (
                <div className="title-input-row">
                  <input
                    id="resume-title-input"
                    className="title-input"
                    type="text"
                    placeholder="Resume title (e.g. Software Engineer Resume)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                  />
                  <button
                    id="btn-confirm-create"
                    className="btn-primary"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? 'Creating…' : 'Create →'}
                  </button>
                  <button className="btn-ghost" onClick={() => setShowInput(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  id="btn-create-resume"
                  className="btn-primary btn-lg"
                  onClick={() => setShowInput(true)}
                >
                  + Create New Resume
                </button>
              )}
            </div>
          </header>

          <main className="landing-main">
            {loading && <div className="loading-state">Loading your resumes…</div>}

            {!loading && resumeList.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <p>No resumes yet. Create your first one above!</p>
              </div>
            )}

            {!loading && resumeList.length > 0 && (
              <section className="resumes-section">
                <h2 className="section-heading">Your Resumes</h2>
                <div className="resume-grid">
                  {resumeList.map((r) => (
                    <div
                      key={r.id}
                      className="resume-card"
                      id={`resume-card-${r.id}`}
                      onClick={() => navigate(`/editor/${r.id}`)}
                    >
                      <div className="resume-card-preview">
                        <div className="preview-header-mock" />
                        <div className="preview-lines">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="preview-line"
                              style={{ width: `${70 + (i % 3) * 10}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="resume-card-info">
                        <h3 className="resume-card-title">{r.title}</h3>
                        <span className="resume-card-date">Updated {fmt(r.updatedAt)}</span>
                      </div>
                      <div className="resume-card-actions">
                        <button
                          id={`btn-edit-${r.id}`}
                          className="card-btn card-btn-edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/editor/${r.id}`)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          id={`btn-delete-${r.id}`}
                          className="card-btn card-btn-delete"
                          onClick={(e) => handleDelete(e, r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </>
      )}

      {activeTab === 'cover-letter' && (
        <main className="landing-workspace-main">
          {resumeList.length > 1 && (
            <div className="active-resume-selector">
              <label>Select Active Resume Context: </label>
              <select
                value={resume?.id || ''}
                onChange={(e) => loadResume(e.target.value)}
              >
                {resumeList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <CoverLetterWorkspace />
        </main>
      )}

      {activeTab === 'ats-score' && (
        <main className="landing-workspace-main">
          {resumeList.length > 1 && (
            <div className="active-resume-selector">
              <label>Select Active Resume Context: </label>
              <select
                value={resume?.id || ''}
                onChange={(e) => loadResume(e.target.value)}
              >
                {resumeList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <ATSCheckerWorkspace />
        </main>
      )}

      {activeTab === 'job-tracker' && (
        <main className="landing-workspace-main">
          <JobTrackerWorkspace />
        </main>
      )}

      <footer className="landing-footer">
        <p>Built with Spring Boot 4 · React 19 · Vite 6</p>
      </footer>

      {showSettingsModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal" style={{ maxWidth: '540px' }}>
            <div className="settings-modal-header">
              <h3>Profile & App Settings</h3>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: settingsTab === 'profile' ? '#1e293b' : 'transparent',
                  color: settingsTab === 'profile' ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  borderBottom: settingsTab === 'profile' ? '2px solid #38bdf8' : 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onClick={() => setSettingsTab('profile')}
              >
                👤 Default Contact Details
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: settingsTab === 'ai' ? '#1e293b' : 'transparent',
                  color: settingsTab === 'ai' ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  borderBottom: settingsTab === 'ai' ? '2px solid #38bdf8' : 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onClick={() => setSettingsTab('ai')}
              >
                ⚙️ AI Settings
              </button>
            </div>

            <div className="settings-modal-body">
              {settingsTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>
                    Set your default personal profile details below. These are automatically used for your cover letters and new resumes.
                  </p>
                  <div className="form-group">
                    <label htmlFor="user-name">Full Name</label>
                    <input
                      id="user-name"
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-title">Professional Title</label>
                    <input
                      id="user-title"
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-email">Email Address</label>
                    <input
                      id="user-email"
                      type="text"
                      placeholder="e.g. alex.morgan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-phone">Mobile / Phone</label>
                    <input
                      id="user-phone"
                      type="text"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-location">City, State</label>
                    <input
                      id="user-location"
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-linkedin">LinkedIn Profile URL</label>
                    <input
                      id="user-linkedin"
                      type="text"
                      placeholder="e.g. linkedin.com/in/alexmorgan"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {settingsTab === 'ai' && (
                <div className="form-group">
                  <label htmlFor="gemini-key-input">Gemini API Key</label>
                  <input
                    id="gemini-key-input"
                    type="password"
                    placeholder="Enter your Gemini API key (e.g. AIzaSy...)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <small className="help-text">
                    Your key is saved locally in your browser and sent only to the backend to generate questions & cover letters.
                  </small>
                </div>
              )}
            </div>

            <div className="settings-modal-footer">
              <button className="btn-primary" onClick={handleSaveSettings}>
                Save Profile & Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

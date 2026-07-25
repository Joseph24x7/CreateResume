import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResumeStore from '../store/resumeStore'
import CoverLetterWorkspace from '../components/workspace/CoverLetterWorkspace'
import ATSCheckerWorkspace from '../components/workspace/ATSCheckerWorkspace'
import JobTrackerWorkspace from '../components/workspace/JobTrackerWorkspace'
import '../styles/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { resumeList, loading, fetchResumeList, createResume, deleteResume, loadResume, resume } = useResumeStore()
  const [activeTab, setActiveTab] = useState('resumes')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')

  useEffect(() => {
    fetchResumeList()
  }, [])

  // Automatically load the latest resume into active store state if available
  useEffect(() => {
    if (resumeList.length > 0 && !resume) {
      loadResume(resumeList[0].id)
    }
  }, [resumeList, resume, loadResume])

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
          <span className="logo-mark">N</span>
          <span className="logo-text">MyNovoResume</span>
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
            title="AI Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </nav>

      {/* ACTIVE TAB CONTENT */}
      {activeTab === 'resumes' && (
        <>
          <header className="landing-hero">
            <div className="hero-badge">✦ Premium Resume Builder</div>
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
          <div className="settings-modal">
            <div className="settings-modal-header">
              <h3>AI Settings</h3>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>
                ✕
              </button>
            </div>
            <div className="settings-modal-body">
              <div className="form-group">
                <label htmlFor="gemini-key-input">Gemini API Key</label>
                <input
                  id="gemini-key-input"
                  type="password"
                  placeholder="Enter your Gemini API key (e.g. AIzaSy...)"
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value)
                    localStorage.setItem('gemini_api_key', e.target.value)
                  }}
                />
                <small className="help-text">
                  Your key is saved locally in your browser and sent only to the backend to generate cover letters. If left blank, a smart local mock simulator will be used.
                </small>
              </div>
            </div>
            <div className="settings-modal-footer">
              <button className="btn-primary" onClick={() => setShowSettingsModal(false)}>
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

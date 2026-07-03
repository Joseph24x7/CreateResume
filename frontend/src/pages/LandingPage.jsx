import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResumeStore from '../store/resumeStore'
import '../styles/landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const { resumeList, loading, fetchResumeList, createResume, deleteResume } = useResumeStore()
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => { fetchResumeList() }, [])

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

  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : ''

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-mark">N</span>
          <span className="logo-text">MyNovoResume</span>
        </div>
      </nav>

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
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
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
              <button className="btn-ghost" onClick={() => setShowInput(false)}>Cancel</button>
            </div>
          ) : (
            <button id="btn-create-resume" className="btn-primary btn-lg" onClick={() => setShowInput(true)}>
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
              {resumeList.map(r => (
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
                        <div key={i} className="preview-line" style={{ width: `${70 + (i % 3) * 10}%` }} />
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
                      onClick={e => { e.stopPropagation(); navigate(`/editor/${r.id}`) }}
                    >Edit</button>
                    <button
                      id={`btn-delete-${r.id}`}
                      className="card-btn card-btn-delete"
                      onClick={e => handleDelete(e, r.id)}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="landing-footer">
        <p>Built with Spring Boot 4 · React 19 · Vite 6</p>
      </footer>
    </div>
  )
}

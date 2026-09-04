import { useState, useEffect } from 'react'

export default function JobTrackerWorkspace() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeJob, setActiveJob] = useState(null)

  // Form states
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [salary, setSalary] = useState('')
  const [status, setStatus] = useState('Wishlist')
  const [dateApplied, setDateApplied] = useState(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/v1/job-applications')
      if (res.ok) {
        const data = await res.json()
        setJobs(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleCreate = async () => {
    if (!company.trim() || !role.trim()) {
      alert('Company name and Role are required.')
      return
    }

    try {
      const res = await fetch('http://localhost:8080/api/v1/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          salary,
          status,
          dateApplied,
          notes,
          url,
        }),
      })

      if (res.ok) {
        fetchJobs()
        setShowAddModal(false)
        resetForm()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async () => {
    if (!activeJob) return
    try {
      const res = await fetch(`http://localhost:8080/api/v1/job-applications/${activeJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          salary,
          status,
          dateApplied,
          notes,
          url,
        }),
      })

      if (res.ok) {
        fetchJobs()
        setShowEditModal(false)
        resetForm()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return
    try {
      const res = await fetch(`http://localhost:8080/api/v1/job-applications/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchJobs()
        setShowEditModal(false)
        resetForm()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMoveStatus = async (job, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/job-applications/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...job,
          status: newStatus,
        }),
      })
      if (res.ok) {
        fetchJobs()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openEditModal = (job) => {
    setActiveJob(job)
    setCompany(job.company)
    setRole(job.role)
    setSalary(job.salary || '')
    setStatus(job.status)
    setDateApplied(job.dateApplied || '')
    setNotes(job.notes || '')
    setUrl(job.url || '')
    setShowEditModal(true)
  }

  const resetForm = () => {
    setActiveJob(null)
    setCompany('')
    setRole('')
    setSalary('')
    setStatus('Wishlist')
    setDateApplied(new Date().toISOString().split('T')[0])
    setNotes('')
    setUrl('')
  }

  const columns = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected']

  const getJobsByColumn = (colName) => {
    return jobs.filter((j) => j.status === colName)
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
          flex-direction: column;
          gap: 20px;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ws-title {
          font-size: 20px;
          font-weight: 600;
          color: #f8fafc;
          margin: 0;
        }
        .btn-ws {
          background: #0284c7;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-ws:hover {
          background: #0369a1;
        }
        .kanban-board {
          display: flex;
          gap: 16px;
          flex-grow: 1;
          overflow-x: auto;
          min-height: 480px;
        }
        .kanban-col {
          flex: 1;
          min-width: 220px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          padding: 14px;
          box-sizing: border-box;
        }
        .col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1.5px solid #334155;
        }
        .col-name {
          font-size: 14px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .col-count {
          background: #334155;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
        }
        .cards-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
          overflow-y: auto;
        }
        .job-card {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
        }
        .job-card:hover {
          border-color: #0284c7;
          transform: translateY(-2px);
        }
        .job-card-role {
          font-size: 13.5px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }
        .job-card-comp {
          font-size: 12px;
          color: #38bdf8;
          font-weight: 600;
        }
        .job-card-meta {
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }
        .job-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 6px;
          border-top: 1px solid #1e293b;
          padding-top: 6px;
        }
        .card-action-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 11px;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .card-action-btn:hover {
          color: #f8fafc;
          background: #1e293b;
        }
        /* ── MODAL ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-container {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          width: 500px;
          max-width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-header h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 16px;
          font-weight: 600;
        }
        .modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 16px;
          cursor: pointer;
        }
        .modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }
        .modal-body .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .modal-body label {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 500;
        }
        .modal-body input, .modal-body textarea, .modal-body select {
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .modal-body input:focus, .modal-body textarea:focus, .modal-body select:focus {
          border-color: #0284c7;
        }
        .modal-footer {
          padding: 12px 20px;
          background: #0f172a;
          border-top: 1px solid #334155;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-cancel {
          background: #334155;
          color: #cbd5e1;
          border: none;
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
        }
      `}</style>

      <div className="header-row">
        <h3 className="ws-title">Job Application Tracker</h3>
        <button
          className="btn-ws"
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
        >
          + Add Application
        </button>
      </div>

      <div className="kanban-board">
        {columns.map((colName) => {
          const colJobs = getJobsByColumn(colName)
          return (
            <div className="kanban-col" key={colName}>
              <div className="col-header">
                <span className="col-name">{colName}</span>
                <span className="col-count">{colJobs.length}</span>
              </div>
              <div className="cards-list">
                {colJobs.map((job) => (
                  <div className="job-card" key={job.id} onClick={() => openEditModal(job)}>
                    <h4 className="job-card-role">{job.role}</h4>
                    <span className="job-card-comp">{job.company}</span>
                    <div className="job-card-meta">
                      <span>{job.salary || 'Salary N/A'}</span>
                      <span>{job.dateApplied}</span>
                    </div>
                    <div className="job-card-actions" onClick={(e) => e.stopPropagation()}>
                      {colName !== 'Wishlist' && (
                        <button
                          className="card-action-btn"
                          onClick={() => handleMoveStatus(job, columns[columns.indexOf(colName) - 1])}
                        >
                          ◀
                        </button>
                      )}
                      {colName !== 'Rejected' && (
                        <button
                          className="card-action-btn"
                          onClick={() => handleMoveStatus(job, columns[columns.indexOf(colName) + 1])}
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add Job Application</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Role / Title *</label>
                <input type="text" placeholder="e.g. Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Salary (optional)</label>
                <input type="text" placeholder="e.g. $140,000/yr" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tracking Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date Applied</label>
                <input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Listing URL</label>
                <input type="text" placeholder="https://careers.company.com/..." value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Notes / Follow-ups</label>
                <textarea rows="3" placeholder="Add custom notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-ws" onClick={handleCreate}>Save Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Application</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Role / Title *</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tracking Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date Applied</label>
                <input type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Listing URL</label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Notes / Follow-ups</label>
                <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" style={{ background: '#ef4444', color: '#ffffff', marginRight: 'auto' }} onClick={() => handleDelete(activeJob.id)}>Delete</button>
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-ws" onClick={handleUpdate}>Update Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

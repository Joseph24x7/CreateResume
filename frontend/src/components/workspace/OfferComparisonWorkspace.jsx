import { useState, useEffect } from 'react'

export default function OfferComparisonWorkspace() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form states
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [baseSalary, setBaseSalary] = useState('')
  const [bonus, setBonus] = useState('')
  const [equity, setEquity] = useState('')
  const [location, setLocation] = useState('Remote')
  const [ptoDays, setPtoDays] = useState('15')
  const [wlbRating, setWlbRating] = useState('3')

  const fetchOffers = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/v1/job-offers')
      if (res.ok) {
        const data = await res.json()
        setOffers(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleCreate = async () => {
    if (!company.trim() || !role.trim()) {
      alert('Company and Role are required.')
      return
    }

    try {
      const res = await fetch('http://localhost:8080/api/v1/job-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          baseSalary: parseFloat(baseSalary) || 0,
          bonus: parseFloat(bonus) || 0,
          equity: parseFloat(equity) || 0,
          location,
          ptoDays: parseInt(ptoDays) || 0,
          wlbRating: parseInt(wlbRating) || 3,
        }),
      })

      if (res.ok) {
        fetchOffers()
        setShowAddModal(false)
        resetForm()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    try {
      const res = await fetch(`http://localhost:8080/api/v1/job-offers/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchOffers()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const resetForm = () => {
    setCompany('')
    setRole('')
    setBaseSalary('')
    setBonus('')
    setEquity('')
    setLocation('Remote')
    setPtoDays('15')
    setWlbRating('3')
  }

  // Calculate highest highlights
  const highestBase = Math.max(...offers.map((o) => o.baseSalary || 0), 0)
  const highestEquity = Math.max(...offers.map((o) => o.equity || 0), 0)
  const highestWlb = Math.max(...offers.map((o) => o.wlbRating || 0), 0)

  const getOffersWithCalculations = () => {
    return offers.map((o) => {
      const totalComp = (o.baseSalary || 0) + (o.bonus || 0) + (o.equity || 0)
      const badges = []
      if (o.baseSalary && o.baseSalary === highestBase) badges.push({ text: 'Highest Cash', class: 'badge-cash' })
      if (o.equity && o.equity === highestEquity) badges.push({ text: 'Most Equity', class: 'badge-equity' })
      if (o.wlbRating && o.wlbRating === highestWlb) badges.push({ text: 'Best WLB', class: 'badge-wlb' })

      return {
        ...o,
        totalComp,
        badges,
      }
    })
  }

  const computedOffers = getOffersWithCalculations()
  const maxTotalComp = Math.max(...computedOffers.map((o) => o.totalComp), 1000)

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
          gap: 24px;
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
        .offers-dashboard {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .offer-card {
          flex: 1;
          min-width: 280px;
          max-width: 380px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }
        .offer-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .offer-company {
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
        }
        .offer-role {
          font-size: 13px;
          color: #38bdf8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .badge-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .badge-cash {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .badge-equity {
          background: rgba(2, 132, 199, 0.1);
          color: #38bdf8;
          border: 1px solid rgba(2, 132, 199, 0.2);
        }
        .badge-wlb {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .comp-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: #0f172a;
          border-radius: 8px;
          border: 1px solid #1e293b;
        }
        .tc-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 700;
          color: #f8fafc;
          border-bottom: 1px solid #334155;
          padding-bottom: 8px;
          margin-bottom: 6px;
        }
        .tc-part {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #cbd5e1;
        }
        .tc-part-bar-container {
          height: 6px;
          background: #334155;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 4px;
        }
        .tc-part-bar {
          height: 100%;
          background: #0284c7;
        }
        .tc-chart-section {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chart-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .chart-label {
          width: 140px;
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 500;
          flex-shrink: 0;
        }
        .chart-bar-container {
          flex-grow: 1;
          height: 12px;
          background: #0f172a;
          border-radius: 6px;
          overflow: hidden;
        }
        .chart-bar {
          height: 100%;
          background: linear-gradient(90deg, #0284c7, #38bdf8);
          border-radius: 6px;
          transition: width 0.4s ease-out;
        }
        .chart-value {
          width: 80px;
          text-align: right;
          font-size: 13px;
          font-weight: 700;
          color: #f8fafc;
          flex-shrink: 0;
        }
        /* ── MODALS ── */
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
        .modal-body input, .modal-body select {
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .modal-body input:focus, .modal-body select:focus {
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
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          padding: 64px 24px;
          gap: 16px;
          background: #1e293b;
          border: 1px dashed #334155;
          border-radius: 12px;
          text-align: center;
        }
        .empty-icon {
          font-size: 48px;
        }
      `}</style>

      <div className="header-row">
        <h3 className="ws-title">Offer Comparison Dashboard</h3>
        <button
          className="btn-ws"
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
        >
          + Add Offer
        </button>
      </div>

      {computedOffers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chart Section */}
          <div className="tc-chart-section">
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Total Compensation Comparison</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {computedOffers.map((o) => (
                <div className="chart-row" key={o.id}>
                  <span className="chart-label">{o.company}</span>
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ width: `${(o.totalComp / maxTotalComp) * 100}%` }} />
                  </div>
                  <span className="chart-value">${o.totalComp.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards section */}
          <div className="offers-dashboard">
            {computedOffers.map((o) => (
              <div className="offer-card" key={o.id}>
                <button
                  className="modal-close"
                  style={{ position: 'absolute', top: '20px', right: '20px' }}
                  onClick={() => handleDelete(o.id)}
                >
                  ✕
                </button>
                <div className="offer-header">
                  <span className="offer-company">{o.company}</span>
                  <span className="offer-role">{o.role}</span>
                </div>

                {o.badges.length > 0 && (
                  <div className="badge-list">
                    {o.badges.map((b, i) => (
                      <span className={`badge-tag ${b.class}`} key={i}>{b.text}</span>
                    ))}
                  </div>
                )}

                <div className="comp-breakdown">
                  <div className="tc-row">
                    <span>Total Comp</span>
                    <span>${o.totalComp.toLocaleString()}</span>
                  </div>
                  <div className="tc-part" style={{ flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Salary</span>
                      <span>${o.baseSalary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="tc-part-bar-container">
                      <div className="tc-part-bar" style={{ width: `${o.totalComp > 0 ? ((o.baseSalary || 0) / o.totalComp) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="tc-part" style={{ flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Annual Bonus</span>
                      <span>${o.bonus?.toLocaleString() || 0}</span>
                    </div>
                    <div className="tc-part-bar-container">
                      <div className="tc-part-bar" style={{ background: '#10b981', width: `${o.totalComp > 0 ? ((o.bonus || 0) / o.totalComp) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="tc-part" style={{ flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Equity / Yr</span>
                      <span>${o.equity?.toLocaleString() || 0}</span>
                    </div>
                    <div className="tc-part-bar-container">
                      <div className="tc-part-bar" style={{ background: '#38bdf8', width: `${o.totalComp > 0 ? ((o.equity || 0) / o.totalComp) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Location</span>
                    <span style={{ fontWeight: '600' }}>{o.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Paid Time Off</span>
                    <span style={{ fontWeight: '600' }}>{o.ptoDays} Days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Work-Life Balance</span>
                    <span style={{ color: '#f59e0b', letterSpacing: '2px' }}>{'★'.repeat(o.wlbRating || 3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">⚖️</span>
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#cbd5e1' }}>No job offers to compare yet</p>
            <p style={{ margin: 0, fontSize: '13px' }}>Click the "Add Offer" button above to register and compare details side-by-side.</p>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add Job Offer</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" placeholder="e.g. Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Role / Title *</label>
                <input type="text" placeholder="e.g. Lead Frontend Architect" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Base Salary ($/yr) *</label>
                <input type="number" placeholder="e.g. 150000" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Annual Cash Bonus ($/yr)</label>
                <input type="number" placeholder="e.g. 15000" value={bonus} onChange={(e) => setBonus(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Annual Stock/Equity ($/yr)</label>
                <input type="number" placeholder="e.g. 40000" value={equity} onChange={(e) => setEquity(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location Setting</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div className="form-group">
                <label>Paid Time Off (days/yr)</label>
                <input type="number" value={ptoDays} onChange={(e) => setPtoDays(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Work-Life Balance Rating (1-5)</label>
                <select value={wlbRating} onChange={(e) => setWlbRating(e.target.value)}>
                  <option value="1">1 Star (Poor)</option>
                  <option value="2">2 Stars (Average)</option>
                  <option value="3">3 Stars (Good)</option>
                  <option value="4">4 Stars (Great)</option>
                  <option value="5">5 Stars (Excellent)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-ws" onClick={handleCreate}>Save Offer Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import useResumeStore from '../../store/resumeStore'

export default function PortfolioWorkspace() {
  const resume = useResumeStore((s) => s.resume)
  const [theme, setTheme] = useState('classic-dark')

  const portfolioHtml = useMemo(() => {
    if (!resume || !resume.data) return '<h1>No Resume Loaded</h1>'

    const { personalInfo = {}, summary = '', experiences = [], educations = [], skillCategories = [], languages = [] } = resume.data
    const name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`
    const title = personalInfo.title || 'Software Professional'

    // Choose themes
    let styles = ''
    let markup = ''

    if (theme === 'classic-dark') {
      styles = `
        body {
          background-color: #0f172a;
          color: #f1f5f9;
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        header {
          text-align: center;
          margin-bottom: 48px;
        }
        h1 {
          font-size: 40px;
          margin: 0 0 8px 0;
          color: #f8fafc;
          letter-spacing: -1px;
        }
        .subtitle {
          font-size: 18px;
          color: #38bdf8;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }
        .summary {
          font-size: 15px;
          line-height: 1.7;
          color: #94a3b8;
          max-width: 650px;
          margin: 0 auto;
        }
        .section-title {
          font-size: 20px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #f8fafc;
          border-left: 4px solid #38bdf8;
          padding-left: 12px;
          margin-bottom: 24px;
          margin-top: 40px;
        }
        .card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .role {
          font-size: 16px;
          font-weight: 700;
          color: #f8fafc;
        }
        .company {
          font-size: 14px;
          color: #38bdf8;
          font-weight: 500;
        }
        .meta {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
        }
        .bullets {
          margin: 12px 0 0 0;
          padding-left: 20px;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.6;
        }
        .bullets li {
          margin-bottom: 6px;
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .skill-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 16px;
        }
        .skill-cat {
          font-weight: 700;
          color: #38bdf8;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .skill-vals {
          font-size: 13px;
          color: #cbd5e1;
        }
        .contact-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 32px;
        }
        .contact-links a {
          color: #38bdf8;
          text-decoration: none;
          font-size: 14px;
        }
        .contact-links a:hover {
          text-decoration: underline;
        }
      `
      markup = `
        <div class="container">
          <header>
            <h1>${name}</h1>
            <div class="subtitle">${title}</div>
            <p class="summary">${summary}</p>
          </header>
          
          <div class="section-title">Skills</div>
          <div class="skills-grid">
            ${skillCategories.map(s => `
              <div class="skill-card">
                <div class="skill-cat">${s.category}</div>
                <div class="skill-vals">${s.skills}</div>
              </div>
            `).join('')}
          </div>

          <div class="section-title">Experience</div>
          ${experiences.map(e => `
            <div class="card">
              <div class="card-header">
                <div>
                  <span class="role">${e.role}</span>
                  <span class="company"> @ ${e.company}</span>
                </div>
                <div class="meta">${e.startDate} - ${e.endDate} | ${e.location}</div>
              </div>
              ${e.project ? `<div style="font-size:13px; color:#94a3b8; font-style:italic;">Project: ${e.project}</div>` : ''}
              <ul class="bullets">
                ${(e.achievements || []).map(ach => `<li>${ach}</li>`).join('')}
              </ul>
            </div>
          `).join('')}

          <div class="section-title">Education</div>
          ${educations.map(edu => `
            <div class="card">
              <div class="card-header">
                <span class="role">${edu.degree}</span>
                <span class="meta">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <div class="company">${edu.institution} | ${edu.location}</div>
            </div>
          `).join('')}

          <div class="contact-links">
            ${personalInfo.email ? `<a href="mailto:${personalInfo.email}">Email</a>` : ''}
            ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}" target="_blank">LinkedIn</a>` : ''}
            ${personalInfo.github ? `<a href="${personalInfo.github}" target="_blank">GitHub</a>` : ''}
            ${personalInfo.leetcode ? `<a href="${personalInfo.leetcode}" target="_blank">LeetCode</a>` : ''}
          </div>
        </div>
      `
    } else if (theme === 'developer-terminal') {
      styles = `
        body {
          background-color: #050505;
          color: #39ff14;
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: 24px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #39ff14;
          padding: 24px;
          box-shadow: 0 0 20px rgba(57, 255, 20, 0.15);
        }
        header {
          border-bottom: 1px dashed #39ff14;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 28px;
          margin: 0 0 8px 0;
        }
        .subtitle {
          font-size: 16px;
        }
        .prompt {
          color: #ffffff;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 32px;
          margin-bottom: 16px;
          border-bottom: 1px solid #39ff14;
          padding-bottom: 4px;
        }
        .bullet-item {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        a {
          color: #39ff14;
          text-decoration: underline;
        }
      `
      markup = `
        <div class="container">
          <header>
            <h1>$ cat user_profile.txt</h1>
            <div class="prompt">NAME:</div> ${name}<br/>
            <div class="prompt">TITLE:</div> ${title}<br/>
            <div class="prompt">SUMMARY:</div> ${summary}
          </header>

          <div class="section-title">SKILLS_INVENTORY</div>
          ${skillCategories.map(s => `
            <div><strong>[${s.category}]</strong>: ${s.skills}</div>
          `).join('<br/>')}

          <div class="section-title">WORK_HISTORY</div>
          ${experiences.map(e => `
            <div style="margin-bottom: 20px;">
              <div>&gt; ${e.role} @ ${e.company} (${e.startDate} - ${e.endDate})</div>
              <div>LOC: ${e.location} | PROJ: ${e.project || 'N/A'}</div>
              <ul style="list-style-type: square; padding-left: 20px; margin-top: 8px;">
                ${(e.achievements || []).map(ach => `<li>${ach}</li>`).join('')}
              </ul>
            </div>
          `).join('')}

          <div class="section-title">ACADEMICS</div>
          ${educations.map(edu => `
            <div style="margin-bottom: 12px;">
              - ${edu.degree} -- ${edu.institution} (${edu.startDate} - ${edu.endDate})
            </div>
          `).join('')}

          <div class="section-title">SYSTEM_CONTACTS</div>
          <div>
            ${personalInfo.email ? `EMAIL: <a href="mailto:${personalInfo.email}">${personalInfo.email}</a><br/>` : ''}
            ${personalInfo.linkedin ? `LINKEDIN: <a href="${personalInfo.linkedin}">${personalInfo.linkedin}</a><br/>` : ''}
            ${personalInfo.github ? `GITHUB: <a href="${personalInfo.github}">${personalInfo.github}</a><br/>` : ''}
          </div>
        </div>
      `
    } else {
      // Creative Minimalist
      styles = `
        body {
          background-color: #fafafa;
          color: #1c1917;
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 750px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        header {
          margin-bottom: 64px;
        }
        .monogram {
          font-size: 56px;
          font-weight: 800;
          letter-spacing: -2px;
          border-bottom: 2px solid #1c1917;
          display: inline-block;
          line-height: 1;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 32px;
          margin: 0 0 4px 0;
          font-weight: 700;
        }
        .subtitle {
          font-size: 14px;
          color: #78716c;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .summary {
          font-size: 15px;
          line-height: 1.6;
          color: #44403c;
          margin-top: 24px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          border-bottom: 1px solid #e7e5e4;
          padding-bottom: 8px;
          margin-top: 48px;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .exp-item {
          margin-bottom: 32px;
        }
        .exp-head {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 600;
        }
        .exp-comp {
          color: #78716c;
          font-size: 13px;
          margin-top: 2px;
        }
        .exp-desc {
          font-size: 14px;
          color: #44403c;
          margin-top: 12px;
          line-height: 1.6;
          padding-left: 12px;
          border-left: 1px solid #e7e5e4;
        }
      `
      markup = `
        <div class="container">
          <header>
            <div class="monogram">
              ${((personalInfo.firstName || '').charAt(0) + (personalInfo.lastName || '').charAt(0)).toUpperCase() || 'P'}
            </div>
            <h1>${name}</h1>
            <div class="subtitle">${title}</div>
            <p class="summary">${summary}</p>
          </header>

          <div class="section-title">Focus & Core Skills</div>
          <div style="font-size: 14px; line-height:1.6;">
            ${skillCategories.map(s => `
              <p><strong>${s.category}</strong><br/>${s.skills}</p>
            `).join('')}
          </div>

          <div class="section-title">Employment</div>
          ${experiences.map(e => `
            <div class="exp-item">
              <div class="exp-head">
                <span>${e.role}</span>
                <span style="font-weight:400; color:#78716c;">${e.startDate} - ${e.endDate}</span>
              </div>
              <div class="exp-comp">${e.company} &middot; ${e.location}</div>
              <div class="exp-desc">
                ${(e.achievements || []).map(ach => `<p style="margin: 0 0 6px 0;">&mdash; ${ach}</p>`).join('')}
              </div>
            </div>
          `).join('')}

          <div class="section-title">Education</div>
          ${educations.map(edu => `
            <div class="exp-item">
              <div class="exp-head">
                <span>${edu.degree}</span>
                <span style="font-weight:400; color:#78716c;">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <div class="exp-comp">${edu.institution}</div>
            </div>
          `).join('')}
        </div>
      `
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} | Portfolio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${styles}
  </style>
</head>
<body>
  ${markup}
</body>
</html>`
  }, [resume, theme])

  const handleExport = () => {
    const element = document.createElement('a')
    const file = new Blob([portfolioHtml], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = 'index.html'
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
        .port-panel-left {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
          flex-shrink: 0;
        }
        .port-panel-right {
          flex-grow: 1;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
        .theme-select-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .theme-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 12px;
          border-radius: 8px;
          background: #0f172a;
          border: 1px solid #334155;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .theme-btn:hover {
          border-color: #475569;
        }
        .theme-btn.active {
          border-color: #0284c7;
          background: rgba(2, 132, 199, 0.1);
          color: #0284c7;
        }
        .theme-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .theme-desc {
          font-size: 11px;
          color: #64748b;
        }
        .theme-btn.active .theme-desc {
          color: #38bdf8;
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
          text-align: center;
          margin-top: auto;
        }
        .btn-ws:hover {
          background: #0369a1;
        }
        .preview-header {
          padding: 12px 20px;
          background: #0f172a;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .iframe-container {
          flex-grow: 1;
          background: #ffffff;
          position: relative;
        }
        .portfolio-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
        }
      `}</style>

      <div className="port-panel-left">
        <div>
          <h3 className="ws-title">Portfolio Builder</h3>
          <p className="ws-desc">Convert your resume instantly into a static webpage layout.</p>
        </div>

        <div className="theme-select-list">
          <button className={`theme-btn ${theme === 'classic-dark' ? 'active' : ''}`} onClick={() => setTheme('classic-dark')}>
            <span className="theme-name">Classic Dark</span>
            <span className="theme-desc">Modern dark grid layout with blue accents.</span>
          </button>
          <button className={`theme-btn ${theme === 'developer-terminal' ? 'active' : ''}`} onClick={() => setTheme('developer-terminal')}>
            <span className="theme-name">Developer Terminal</span>
            <span className="theme-desc">Retro monospaced CLI console output.</span>
          </button>
          <button className={`theme-btn ${theme === 'creative-minimal' ? 'active' : ''}`} onClick={() => setTheme('creative-minimal')}>
            <span className="theme-name">Creative Minimal</span>
            <span className="theme-desc">Lightweight typography with large monograms.</span>
          </button>
        </div>

        <button className="btn-ws" onClick={handleExport}>
          Export index.html 🚀
        </button>
      </div>

      <div className="port-panel-right">
        <div className="preview-header">
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#cbd5e1' }}>Live Sandbox Preview</span>
          <span style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748b' }}>Interactive viewport</span>
        </div>
        <div className="iframe-container">
          <iframe srcDoc={portfolioHtml} title="Portfolio Preview" className="portfolio-iframe" />
        </div>
      </div>
    </div>
  )
}

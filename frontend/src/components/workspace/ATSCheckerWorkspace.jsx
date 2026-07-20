import { useState, useMemo } from 'react'
import useResumeStore from '../../store/resumeStore'

export default function ATSCheckerWorkspace() {
  const resume = useResumeStore((s) => s.resume)
  const [jobDescription, setJobDescription] = useState('')

  // Calculate ATS metrics using local heuristics
  const analysis = useMemo(() => {
    if (!resume || !resume.data) {
      return { score: 0, criteria: [], fixes: [], keywordsMatch: null }
    }

    const { personalInfo = {}, summary = '', experiences = [], skillCategories = [], educations = [] } = resume.data

    let score = 30 // base score
    const criteria = []
    const fixes = []
    const suggestions = []

    // 1. Check Contact Info (Max 15 pts)
    let contactPts = 0
    const missingContact = []
    if (personalInfo.email) contactPts += 3
    else missingContact.push('Email')
    if (personalInfo.phone) contactPts += 3
    else missingContact.push('Phone')
    if (personalInfo.location) contactPts += 3
    else missingContact.push('Location')
    if (personalInfo.linkedin) contactPts += 3
    else missingContact.push('LinkedIn')
    if (personalInfo.github || personalInfo.leetcode) contactPts += 3
    else missingContact.push('GitHub/LeetCode')

    score += contactPts
    criteria.push({ name: 'Contact Information', score: contactPts, max: 15, status: contactPts === 15 ? 'success' : 'warn' })
    if (missingContact.length > 0) {
      fixes.push(`Add missing contact links: ${missingContact.join(', ')}.`)
    }

    // 2. Check Summary (Max 10 pts)
    const summaryLen = summary?.trim().length || 0
    let summaryPts = 0
    if (summaryLen > 100) summaryPts = 10
    else if (summaryLen > 0) summaryPts = 5

    score += summaryPts
    criteria.push({ name: 'Professional Summary', score: summaryPts, max: 10, status: summaryPts === 10 ? 'success' : 'warn' })
    if (summaryPts === 0) {
      fixes.push('Write a professional summary to help ATS identify your profile theme.')
    } else if (summaryPts === 5) {
      suggestions.push('Expand your summary slightly to make it a rich profile overview.')
    }

    // 3. Check Work Experience & Action Verbs (Max 25 pts)
    let expPts = 0
    if (experiences.length > 0) {
      expPts += 15 // has experience
      // Check for action verbs in achievements
      const actionVerbs = ['designed', 'built', 'developed', 'led', 'spearheaded', 'optimised', 'optimized', 'managed', 'created', 'implemented', 'achieved', 'improved', 'increased', 'reduced', 'constructed', 'delivered']
      let totalBullets = 0
      let actionVerbCount = 0

      experiences.forEach(e => {
        if (e.achievements) {
          e.achievements.forEach(ach => {
            totalBullets++
            const words = ach.toLowerCase().split(/\s+/)
            const hasVerb = words.some(w => actionVerbs.includes(w))
            if (hasVerb) actionVerbCount++
          })
        }
      })

      if (totalBullets > 0) {
        const verbRatio = actionVerbCount / totalBullets
        if (verbRatio >= 0.5) expPts += 10
        else if (verbRatio >= 0.2) expPts += 5
      }

      if (actionVerbCount < 3) {
        fixes.push('Use strong action verbs (e.g. Spearheaded, Optimised, Constructed) to start your experience bullet points.')
      }
    } else {
      fixes.push('You must include at least one professional work experience.')
    }

    score += expPts
    criteria.push({ name: 'Work History & Impact', score: expPts, max: 25, status: expPts >= 20 ? 'success' : 'warn' })

    // 4. Skills Section (Max 20 pts)
    let skillsPts = 0
    const categoriesCount = skillCategories.length
    if (categoriesCount > 2) skillsPts = 20
    else if (categoriesCount > 0) skillsPts = 10

    score += skillsPts
    criteria.push({ name: 'Skills & Keywords Mapping', score: skillsPts, max: 20, status: skillsPts === 20 ? 'success' : 'warn' })
    if (categoriesCount === 0) {
      fixes.push('Create a structured skills section categorized by domains.')
    }

    // 5. Structure and formatting (Max 10 pts)
    let formatPts = 10
    if (educations.length === 0) {
      formatPts -= 5
      fixes.push('Include your education background details.')
    }
    score += formatPts
    criteria.push({ name: 'Layout Structure', score: formatPts, max: 10, status: formatPts === 10 ? 'success' : 'warn' })

    // Ensure score is capped at 100
    score = Math.min(100, score)

    // Parse Job Description Keywords if provided
    let keywordsAnalysis = null
    if (jobDescription.trim().length > 10) {
      const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,15}\b/g) || []
      const resumeText = JSON.stringify(resume.data).toLowerCase()

      // Define some standard high-value tech/ATS keywords to scan for
      const commonTechKeywords = [
        'react', 'vue', 'angular', 'node', 'express', 'python', 'java', 'spring', 'boot', 'docker', 'kubernetes',
        'aws', 'cloud', 'sql', 'nosql', 'mongodb', 'postgresql', 'typescript', 'javascript', 'html', 'css',
        'git', 'ci/cd', 'agile', 'scrum', 'testing', 'security', 'apis', 'rest', 'graphql', 'architecture',
        'performance', 'scalability', 'data', 'analytics', 'backend', 'frontend', 'fullstack', 'machine', 'learning',
        'linux', 'redux', 'system', 'design', 'collaboration', 'leader', 'mentor'
      ]

      const presentKeywords = []
      const missingKeywords = []

      // Find keywords that are present in the Job Description
      const jdKeywords = [...new Set(jdWords.filter(w => commonTechKeywords.includes(w)))]

      jdKeywords.forEach(kw => {
        if (resumeText.includes(kw)) {
          presentKeywords.push(kw)
        } else {
          missingKeywords.push(kw)
        }
      })

      const totalCount = jdKeywords.length
      const matchRate = totalCount > 0 ? Math.round((presentKeywords.length / totalCount) * 100) : 100

      keywordsAnalysis = {
        matchRate,
        present: presentKeywords,
        missing: missingKeywords,
      }
    }

    return {
      score,
      criteria,
      fixes,
      suggestions,
      keywordsMatch: keywordsAnalysis,
    }
  }, [resume, jobDescription])

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
        .ats-panel-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
        }
        .ats-panel-right {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .ats-header {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #334155;
        }
        .score-circle-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: radial-gradient(closest-side, #1e293b 80%, transparent 0%),
                      conic-gradient(#0284c7 ${analysis.score}%, #334155 0%);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
        }
        .score-circle-text {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
        }
        .score-label {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .score-label h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .score-label span {
          font-size: 13px;
          color: #94a3b8;
        }
        .criteria-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .criteria-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .criteria-name {
          color: #cbd5e1;
        }
        .criteria-bar-container {
          flex-grow: 1;
          max-width: 120px;
          height: 6px;
          background: #334155;
          border-radius: 3px;
          margin: 0 16px;
          overflow: hidden;
        }
        .criteria-bar {
          height: 100%;
          background: #0284c7;
          border-radius: 3px;
        }
        .criteria-value {
          color: #94a3b8;
          font-family: monospace;
        }
        .section-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #f8fafc;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
        }
        .check-icon-red {
          color: #ef4444;
          flex-shrink: 0;
        }
        .check-icon-green {
          color: #10b981;
          flex-shrink: 0;
        }
        .jd-textarea {
          width: 100%;
          height: 100px;
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          outline: none;
          resize: none;
          box-sizing: border-box;
        }
        .jd-textarea:focus {
          border-color: #0284c7;
        }
        .kw-badge-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .kw-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .kw-badge.present {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .kw-badge.missing {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
      `}</style>

      <div className="ats-panel-left">
        <div className="ats-header">
          <div className="score-circle-wrapper">
            <span className="score-circle-text">{analysis.score}%</span>
          </div>
          <div className="score-label">
            <h3>ATS Compliance Score</h3>
            <span>Estimated rating based on layout and text patterns.</span>
          </div>
        </div>

        <div className="criteria-list">
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Score Breakdown</h4>
          {analysis.criteria.map((c, i) => (
            <div className="criteria-item" key={i}>
              <span className="criteria-name">{c.name}</span>
              <div className="criteria-bar-container">
                <div className="criteria-bar" style={{ width: `${(c.score / c.max) * 100}%` }} />
              </div>
              <span className="criteria-value">{c.score}/{c.max}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ats-panel-right">
        <div className="section-card">
          <h3 className="section-title">
            <span className="check-icon-red">⚠️</span> Action Required
          </h3>
          <div className="checklist">
            {analysis.fixes.length > 0 ? (
              analysis.fixes.map((f, i) => (
                <div className="check-item" key={i}>
                  <span className="check-icon-red">✕</span>
                  <span>{f}</span>
                </div>
              ))
            ) : (
              <div className="check-item">
                <span className="check-icon-green">✓</span>
                <span style={{ color: '#10b981' }}>No critical issues found! Your resume format is ATS optimized.</span>
              </div>
            )}
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">📊 Keyword Scanner</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px 0' }}>
            Paste the job description of your target role to compare resume keyword density.
          </p>
          <textarea
            className="jd-textarea"
            placeholder="Paste Job Description / Requirements details..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          {analysis.keywordsMatch && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#cbd5e1' }}>Keyword Match Rate</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0284c7' }}>{analysis.keywordsMatch.matchRate}%</span>
              </div>
              
              <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', background: '#0284c7', width: `${analysis.keywordsMatch.matchRate}%` }} />
              </div>

              {analysis.keywordsMatch.present.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>Matching Keywords</span>
                  <div className="kw-badge-grid">
                    {analysis.keywordsMatch.present.map((kw, i) => (
                      <span className="kw-badge present" key={i}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.keywordsMatch.missing.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>Missing Keywords (Pasted JD)</span>
                  <div className="kw-badge-grid">
                    {analysis.keywordsMatch.missing.map((kw, i) => (
                      <span className="kw-badge missing" key={i}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

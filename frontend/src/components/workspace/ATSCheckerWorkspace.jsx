/**
 * ═══════════════════════════════════════════════════════════════
 *  Streamlined & User-Friendly ATS Score Checker
 *  ───────────────────────────────────────────────────────────
 *  A clean, intuitive workspace focused on:
 *  1. ATS Match Score & Structural Audit
 *  2. High-Value Missing Keywords Extraction (Red Badges)
 *  3. Matched Technical Keywords (Green Badges)
 *  4. Clear Actionable Recommendations
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from 'react';
import useResumeStore from '../../store/resumeStore';
import { runFullAnalysis } from '../../utils/ats-engine/scoringEngine';
import '../../styles/ats-engine.css';

export default function ATSCheckerWorkspace() {
  const resume = useResumeStore((s) => s.resume);
  const [jobDescription, setJobDescription] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Perform multi-factor NLP & keyword match analysis
  const analysis = useMemo(() => {
    return runFullAnalysis(resume?.data, jobDescription);
  }, [resume?.data, jobDescription]);

  const {
    interviewProbability = 0,
    hasJD = false,
    skillAnalysis = { matched: [], missing: [] },
    dimensions = [],
    achievementAnalysis = { quantificationRatio: 0 },
    qualityAnalysis = { score: 0 },
  } = analysis;

  // Extract missing and matched keywords cleanly
  const missingKeywords = useMemo(() => {
    return (skillAnalysis.missing || []).sort((a, b) => (b.demandScore || 50) - (a.demandScore || 50));
  }, [skillAnalysis.missing]);

  const matchedKeywords = useMemo(() => {
    return (skillAnalysis.matched || []).sort((a, b) => (b.demandScore || 50) - (a.demandScore || 50));
  }, [skillAnalysis.matched]);

  // Status Badge Label
  const statusInfo = useMemo(() => {
    if (interviewProbability >= 80) return { label: 'Excellent Match', class: 'good' };
    if (interviewProbability >= 60) return { label: 'Good Match', class: 'medium' };
    return { label: 'Needs Optimization', class: 'poor' };
  }, [interviewProbability]);

  // Copy keyword to clipboard helper
  const copyKeyword = (kwName) => {
    navigator.clipboard.writeText(kwName);
    setCopiedKey(kwName);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Extract top actionable recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    if (missingKeywords.length > 0) {
      recs.push(`Add top missing JD keywords: ${missingKeywords.slice(0, 4).map(k => k.name).join(', ')}`);
    }
    if ((achievementAnalysis.quantificationRatio || 0) < 0.3) {
      recs.push('Quantify experience bullet points with metrics (%, $, x multipliers)');
    }
    if (!resume?.data?.personalInfo?.linkedin) {
      recs.push('Include a LinkedIn profile link in Contact Information');
    }
    if (!resume?.data?.summary || resume.data.summary.trim().split(/\s+/).length < 25) {
      recs.push('Expand Professional Summary (aim for 30-80 words with role keywords)');
    }
    if (recs.length === 0) {
      recs.push('Your resume structure and keyword density are well-optimized!');
    }
    return recs;
  }, [missingKeywords, achievementAnalysis, resume?.data]);

  return (
    <div className="ats-dashboard">
      {/* Header */}
      <div className="ats-simple-header">
        <h1>🎯 ATS Resume Checker</h1>
        <p>Paste your target Job Description to identify missing high-value keywords and optimize your score.</p>
      </div>

      {/* 2-Column Split Layout */}
      <div className="ats-simple-layout">

        {/* Left Column: ATS Score & Recommendations */}
        <div className="ats-left-col">
          {/* Score Gauge Card */}
          <div className="ats-card ats-score-hero-card">
            <div
              className="ats-circle-gauge"
              style={{
                background: `conic-gradient(${
                  interviewProbability >= 80 ? '#10b981' : interviewProbability >= 60 ? '#f59e0b' : '#ef4444'
                } ${(interviewProbability / 100) * 360}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            >
              <div className="ats-circle-gauge-inner">
                <span className="ats-gauge-num">{interviewProbability}</span>
                <span className="ats-gauge-unit">Match Score</span>
              </div>
            </div>

            <div className={`ats-status-pill ${statusInfo.class}`}>
              {statusInfo.label}
            </div>

            {/* Core Breakdown Bars */}
            <div className="ats-criteria-list">
              {dimensions.slice(0, 4).map((dim) => (
                <div key={dim.name} className="ats-criteria-row">
                  <div className="ats-criteria-info">
                    <span className="ats-criteria-name">{dim.icon} {dim.name}</span>
                    <span className="ats-criteria-val">{dim.score}%</span>
                  </div>
                  <div className="ats-criteria-bar-bg">
                    <div
                      className="ats-criteria-bar-fill"
                      style={{
                        width: `${dim.score}%`,
                        background: dim.score >= 70 ? '#10b981' : dim.score >= 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="ats-card">
            <h3 className="ats-recs-title">💡 Recommended Improvements</h3>
            <ul className="ats-rec-list">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="ats-rec-item">
                  <span>🔹</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Job Description & Keywords */}
        <div className="ats-right-col">

          {/* JD Input Card */}
          <div className="ats-card">
            <div className="ats-jd-title-row">
              <h2>📄 Target Job Description</h2>
              {jobDescription && (
                <button className="ats-clear-btn" onClick={() => setJobDescription('')}>
                  Clear Text
                </button>
              )}
            </div>

            <textarea
              className="ats-simple-textarea"
              placeholder="Paste the target Job Description here... Our NLP engine will analyze missing skills and high-value keywords in real-time."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Keywords Section */}
          <div className="ats-card">
            {/* Missing Keywords */}
            <div className="ats-kw-box">
              <div className="ats-kw-box-header">
                <span style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ⚠️ Missing High-Value JD Keywords
                </span>
                <span className="ats-kw-count" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                  {missingKeywords.length} Missing
                </span>
              </div>

              {missingKeywords.length > 0 ? (
                <div className="ats-kw-grid">
                  {missingKeywords.map((kw) => (
                    <span
                      key={kw.id || kw.name}
                      className="ats-kw-badge missing"
                      onClick={() => copyKeyword(kw.name)}
                      title="Click to copy keyword"
                      style={{ cursor: 'pointer' }}
                    >
                      + {kw.name}
                      {copiedKey === kw.name ? (
                        <span className="ats-copy-hint" style={{ color: '#10b981' }}>✓ Copied</span>
                      ) : (
                        <span className="ats-copy-hint">📋</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  {hasJD
                    ? '🎉 Excellent! No major technical keywords missing from the Job Description.'
                    : 'Paste a Job Description above to discover missing skills and keywords.'}
                </div>
              )}
            </div>

            {/* Matched Keywords */}
            {hasJD && matchedKeywords.length > 0 && (
              <div className="ats-kw-box" style={{ marginTop: '1.75rem' }}>
                <div className="ats-kw-box-header">
                  <span style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ✅ Matched Technical Keywords
                  </span>
                  <span className="ats-kw-count" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                    {matchedKeywords.length} Matched
                  </span>
                </div>

                <div className="ats-kw-grid">
                  {matchedKeywords.map((kw) => (
                    <span key={kw.id || kw.name} className="ats-kw-badge matched">
                      ✓ {kw.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

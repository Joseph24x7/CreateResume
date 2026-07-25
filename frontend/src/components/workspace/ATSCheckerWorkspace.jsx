/**
 * ═══════════════════════════════════════════════════════════════
 *  Standalone NLP ATS Resume Optimizer Workspace
 *  ───────────────────────────────────────────────────────────
 *  Powered by `natural` and `keyword-extractor` NLP libraries.
 *  - Extract genuine high-value keywords
 *  - Compare Resume vs Target Job Description
 *  - Highlighting Missing Keywords for quick 1-click copying
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from 'react';
import useResumeStore from '../../store/resumeStore';
import { analyzeResumeATS } from '../../utils/nlpAtsEngine';
import '../../styles/ats-engine.css';

export default function ATSCheckerWorkspace() {
  const resume = useResumeStore((s) => s.resume);
  const [jobDescription, setJobDescription] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Run standalone NLP analysis
  const analysis = useMemo(() => {
    return analyzeResumeATS(resume?.data, jobDescription);
  }, [resume?.data, jobDescription]);

  const {
    score = 0,
    hasJD = false,
    matchedKeywords = [],
    missingKeywords = [],
    suggestions = [],
  } = analysis;

  // Status Badge Label
  const statusInfo = useMemo(() => {
    if (score >= 80) return { label: 'Excellent Match', class: 'good' };
    if (score >= 60) return { label: 'Good Match', class: 'medium' };
    return { label: 'Needs Optimization', class: 'poor' };
  }, [score]);

  // Copy keyword helper
  const copyKeyword = (kwName) => {
    navigator.clipboard.writeText(kwName);
    setCopiedKey(kwName);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="ats-dashboard">
      {/* Header */}
      <div className="ats-simple-header">
        <h1>🎯 Standalone NLP ATS Checker</h1>
        <p>Paste your target Job Description to extract genuine keywords and copy missing skills to your resume.</p>
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
                  score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
                } ${(score / 100) * 360}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            >
              <div className="ats-circle-gauge-inner">
                <span className="ats-gauge-num">{score}</span>
                <span className="ats-gauge-unit">ATS Score</span>
              </div>
            </div>

            <div className={`ats-status-pill ${statusInfo.class}`}>
              {statusInfo.label}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="ats-card">
            <h3 className="ats-recs-title">💡 Actionable Recommendations</h3>
            <ul className="ats-rec-list">
              {suggestions.map((rec, idx) => (
                <li key={idx} className="ats-rec-item">
                  <span>🔹</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Job Description & Keyword Scanner */}
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
              placeholder="Paste the target Job Description here... Standalone NLP tokenization & TF-IDF vectorization will analyze missing keywords in real-time."
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
                      key={kw.name}
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
                    ? '🎉 Excellent! All key terms from the Job Description are present in your resume.'
                    : 'Paste a Job Description above to discover missing skills and keywords.'}
                </div>
              )}
            </div>

            {/* Matched Keywords */}
            {hasJD && matchedKeywords.length > 0 && (
              <div className="ats-kw-box" style={{ marginTop: '1.75rem' }}>
                <div className="ats-kw-box-header">
                  <span style={{ color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ✅ Matched Keywords
                  </span>
                  <span className="ats-kw-count" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                    {matchedKeywords.length} Matched
                  </span>
                </div>

                <div className="ats-kw-grid">
                  {matchedKeywords.map((kw) => (
                    <span key={kw.name} className="ats-kw-badge matched">
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

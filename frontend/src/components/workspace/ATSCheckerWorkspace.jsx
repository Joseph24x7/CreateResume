/**
 * ═══════════════════════════════════════════════════════════════
 *  ATS Recruiter Decision Engine — Dashboard Workspace
 *  ───────────────────────────────────────────────────────────
 *  Premium analytics dashboard that estimates Interview
 *  Probability through 10 scoring dimensions with full
 *  explainability.
 *
 *  Architecture:
 *    Resume + JD → Multi-Agent Scoring → Learning-to-Rank
 *    → Interview Probability + Dimension Breakdown
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo, useCallback } from 'react';
import useResumeStore from '../../store/resumeStore';
import { runFullAnalysis } from '../../utils/ats-engine/scoringEngine';
import '../../styles/ats-engine.css';

// ── SVG Radar Chart Component ────────────────────────────────

function RadarChart({ dimensions }) {
  const cx = 200, cy = 200, maxR = 150;
  const n = dimensions.length;
  if (n === 0) return null;

  const angleStep = (2 * Math.PI) / n;

  // Generate grid polygons (at 25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  function polarToCart(angle, radius) {
    const x = cx + radius * Math.sin(angle);
    const y = cy - radius * Math.cos(angle);
    return { x, y };
  }

  function polygonPoints(radius) {
    return dimensions
      .map((_, i) => {
        const { x, y } = polarToCart(i * angleStep, radius);
        return `${x},${y}`;
      })
      .join(' ');
  }

  // Data polygon
  const dataPoints = dimensions.map((d, i) => {
    const r = (d.score / 100) * maxR;
    return polarToCart(i * angleStep, r);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Label positions (slightly beyond the max radius)
  const labelR = maxR + 30;

  return (
    <svg className="ats-radar-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
      {/* Grid polygons */}
      {gridLevels.map((level, idx) => (
        <polygon
          key={idx}
          className="ats-radar-grid"
          points={polygonPoints(maxR * level)}
        />
      ))}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const end = polarToCart(i * angleStep, maxR);
        return (
          <line
            key={i}
            className="ats-radar-axis"
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
          />
        );
      })}

      {/* Data shape */}
      <polygon className="ats-radar-shape" points={dataPolygon} />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} className="ats-radar-point" cx={p.x} cy={p.y} r={4}>
          <title>{dimensions[i].name}: {dimensions[i].score}</title>
        </circle>
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const pos = polarToCart(i * angleStep, labelR);
        // Adjust text anchor based on position
        let anchor = 'middle';
        if (pos.x < cx - 10) anchor = 'end';
        else if (pos.x > cx + 10) anchor = 'start';

        let dy = '0.35em';
        if (pos.y < cy - maxR) dy = '0em';
        else if (pos.y > cy + maxR) dy = '0.7em';

        // Shorten names for radar
        const shortName = d.name
          .replace('Confidence', 'Conf.')
          .replace('Relevance', 'Relev.')
          .replace('Progression', 'Growth')
          .replace('Alignment', 'Align.')
          .replace('Complexity', 'Complex.')
          .replace('Coverage', 'Cover.')
          .replace('Evidence', 'Evid.');

        return (
          <text
            key={i}
            className="ats-radar-label"
            x={pos.x}
            y={pos.y}
            textAnchor={anchor}
            dominantBaseline="central"
          >
            {shortName}
          </text>
        );
      })}
    </svg>
  );
}


// ── Score Color Helper ───────────────────────────────────────

function getScoreColor(score) {
  if (score >= 70) return 'var(--ats-score-good)';
  if (score >= 40) return 'var(--ats-score-medium)';
  return 'var(--ats-score-poor)';
}

function getScoreBg(score) {
  if (score >= 70) return 'var(--ats-score-good-bg)';
  if (score >= 40) return 'var(--ats-score-medium-bg)';
  return 'var(--ats-score-poor-bg)';
}

function getScoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 40) return 'score-medium';
  return 'score-low';
}

function getMatchClass(score) {
  if (score >= 0.7) return 'strong';
  if (score >= 0.4) return 'moderate';
  return 'weak';
}


// ── Dimension Card Component ─────────────────────────────────

function DimensionCard({ dimension, isExpanded, onToggle }) {
  const { name, icon, score, explanation } = dimension;
  const { positives = [], negatives = [], recommendations = [] } = explanation;

  return (
    <div
      className={`ats-dimension-card ${isExpanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <div className="ats-dimension-header">
        <span className="ats-dimension-name">{icon} {name}</span>
        <span
          className="ats-dimension-score"
          style={{
            background: getScoreBg(score),
            color: getScoreColor(score),
          }}
        >
          {score}/100
        </span>
        <span className="ats-dimension-chevron">
          {isExpanded ? '▲' : '▼'}
        </span>
        <div className="ats-dimension-bar">
          <div
            className={`ats-dimension-bar-fill ${getScoreClass(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="ats-dimension-details">
        {positives.map((item, i) => (
          <div key={`p-${i}`} className="ats-detail-item positive">
            <span>{item.text}</span>
            <span className="ats-detail-impact">+{item.impact}</span>
          </div>
        ))}
        {negatives.map((item, i) => (
          <div key={`n-${i}`} className="ats-detail-item negative">
            <span>{item.text}</span>
            <span className="ats-detail-impact">{item.impact}</span>
          </div>
        ))}
        {recommendations.map((rec, i) => (
          <div key={`r-${i}`} className="ats-recommendation-item">
            {rec}
          </div>
        ))}
        {positives.length === 0 && negatives.length === 0 && (
          <div style={{ color: '#64748b', fontStyle: 'italic' }}>
            Paste a job description for detailed analysis
          </div>
        )}
      </div>
    </div>
  );
}


// ── Main ATSCheckerWorkspace Component ───────────────────────

export default function ATSCheckerWorkspace() {
  const resume = useResumeStore((s) => s.resume);
  const [jobDescription, setJobDescription] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [showJdInput, setShowJdInput] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Run full analysis whenever resume or JD changes
  const analysis = useMemo(() => {
    return runFullAnalysis(resume?.data, jobDescription);
  }, [resume?.data, jobDescription]);

  const toggleCard = useCallback((dimName) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(dimName)) next.delete(dimName);
      else next.add(dimName);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedCards(new Set(analysis.dimensions.map(d => d.name)));
  }, [analysis.dimensions]);

  const collapseAll = useCallback(() => {
    setExpandedCards(new Set());
  }, []);

  // AI Deep Analysis (optional Gemini integration)
  const runAiAnalysis = useCallback(async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      alert('Please set your Gemini API Key in Settings first.');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please paste a job description for AI analysis.');
      return;
    }

    setAiLoading(true);
    try {
      const resumeText = buildResumeText(resume?.data);
      const response = await fetch('/api/v1/ai/recruiter-evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-Key': apiKey,
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiResults(data);
      } else {
        console.error('AI analysis failed:', response.statusText);
        setAiResults(null);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      setAiResults(null);
    } finally {
      setAiLoading(false);
    }
  }, [jobDescription, resume?.data]);

  // Build resume text for AI endpoint
  function buildResumeText(data) {
    if (!data) return '';
    const parts = [];
    const pi = data.personalInfo || {};
    parts.push(`${pi.firstName || ''} ${pi.lastName || ''} - ${pi.title || ''}`);
    if (data.summary) parts.push(`Summary: ${data.summary}`);
    (data.skillCategories || []).forEach(sc => {
      parts.push(`${sc.category}: ${sc.skills}`);
    });
    (data.experiences || []).forEach(exp => {
      parts.push(`${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})`);
      (exp.achievements || []).forEach(a => parts.push(`  - ${a}`));
    });
    (data.educations || []).forEach(ed => {
      parts.push(`${ed.degree} from ${ed.institution}`);
    });
    return parts.join('\n');
  }

  // Destructure analysis
  const {
    interviewProbability,
    confidenceInterval,
    hasJD,
    dimensions,
    personas,
    skillAnalysis,
    responsibilityMatches,
    achievementAnalysis,
  } = analysis;

  return (
    <div className="ats-dashboard">

      {/* ── JD Input Section ──────────────────────────────── */}
      <div className="ats-dashboard-header">
        <div className="ats-jd-input-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: showJdInput ? '1rem' : 0,
            }}
            onClick={() => setShowJdInput(!showJdInput)}
          >
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              📋 Job Description
            </h2>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {showJdInput ? '▲ Collapse' : '▼ Expand'} {jobDescription ? '(Active)' : ''}
            </span>
          </div>

          {showJdInput && (
            <>
              <textarea
                className="ats-jd-textarea"
                placeholder="Paste the target job description here for a comprehensive multi-dimensional analysis. Without a JD, only structural scoring is performed..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
              />
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                {jobDescription && (
                  <button
                    className="ats-analyze-btn"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: 0, background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    onClick={() => setJobDescription('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Hero Section ──────────────────────────────────── */}
      <div className="ats-hero-section">

        {/* Left: Interview Probability */}
        <div className="ats-probability-card">
          <div
            className="ats-score-ring"
            style={{
              '--score-deg': `${(interviewProbability / 100) * 360}deg`,
              background: `conic-gradient(${getScoreColor(interviewProbability)} ${(interviewProbability / 100) * 360}deg, rgba(255,255,255,0.1) 0deg)`,
            }}
          >
            <div className="ats-score-ring-inner">
              <span className="ats-score-ring-value">{interviewProbability}</span>
              <span className="ats-score-ring-label">Score</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="ats-probability-label">Interview Probability</div>
            <div className="ats-confidence-interval">
              ±{confidenceInterval}% confidence interval
            </div>
          </div>

          {/* Persona scores */}
          <div className="ats-persona-scores">
            {Object.values(personas).map((p) => (
              <div className="ats-persona-item" key={p.label}>
                <span className="ats-persona-label">{p.icon} {p.label}</span>
                <span
                  className="ats-persona-score"
                  style={{ color: getScoreColor(p.score) }}
                >
                  {p.score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Radar Chart */}
        <div className="ats-radar-card">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#94a3b8' }}>
            Multi-Dimensional Analysis
          </h3>
          <RadarChart dimensions={dimensions} />
        </div>
      </div>

      {/* ── Dimension Score Cards ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="ats-section-title" style={{ marginBottom: 0 }}>
          📊 Scoring Dimensions
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={expandAll}
            style={{
              background: 'transparent',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#94a3b8',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            style={{
              background: 'transparent',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#94a3b8',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="ats-dimensions-section">
        {dimensions.map((dim) => (
          <DimensionCard
            key={dim.name}
            dimension={dim}
            isExpanded={expandedCards.has(dim.name)}
            onToggle={() => toggleCard(dim.name)}
          />
        ))}
      </div>

      {/* ── Responsibility Match Table ────────────────────── */}
      {hasJD && responsibilityMatches.length > 0 && (
        <div className="ats-responsibility-section">
          <h2 className="ats-section-title">✅ Responsibility Match Analysis</h2>
          <table className="ats-match-table">
            <thead>
              <tr>
                <th>JD Requirement</th>
                <th>Best Resume Match</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {responsibilityMatches.slice(0, 12).map((match, i) => (
                <tr key={i} className={`ats-match-row ${getMatchClass(match.score)}`}>
                  <td style={{ maxWidth: '300px' }}>
                    {match.requirement.length > 80
                      ? match.requirement.substring(0, 77) + '...'
                      : match.requirement}
                  </td>
                  <td style={{ maxWidth: '300px', color: '#94a3b8' }}>
                    {match.bestMatch
                      ? (match.bestMatch.length > 80
                          ? match.bestMatch.substring(0, 77) + '...'
                          : match.bestMatch)
                      : '(no match)'}
                  </td>
                  <td>
                    <span className="ats-match-score-badge">
                      {Math.round(match.score * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Skill Ontology Grid ───────────────────────────── */}
      {hasJD && skillAnalysis && (skillAnalysis.matched.length > 0 || skillAnalysis.missing.length > 0) && (
        <div className="ats-skills-section">
          <h2 className="ats-section-title">🎯 Skill Ontology Map</h2>

          {/* Group by category */}
          {(() => {
            const categories = {};

            skillAnalysis.matched.forEach(skill => {
              const cat = skill.category || 'Other';
              if (!categories[cat]) categories[cat] = { matched: [], missing: [] };
              categories[cat].matched.push(skill);
            });

            skillAnalysis.missing.forEach(skill => {
              const cat = skill.category || 'Other';
              if (!categories[cat]) categories[cat] = { matched: [], missing: [] };
              categories[cat].missing.push(skill);
            });

            return Object.entries(categories)
              .sort(([, a], [, b]) => (b.matched.length + b.missing.length) - (a.matched.length + a.missing.length))
              .map(([cat, { matched, missing }]) => (
                <div className="ats-skill-category" key={cat}>
                  <div className="ats-skill-category-name">
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      ({matched.length}/{matched.length + missing.length})
                    </span>
                  </div>
                  <div className="ats-skill-badges">
                    {matched.map(skill => (
                      <span
                        key={skill.id || skill.name}
                        className={`ats-skill-badge ${skill.inferred ? 'inferred' : 'matched'}`}
                        title={skill.inferred ? 'Inferred from context' : 'Direct match'}
                      >
                        {skill.inferred ? '⚡' : '●'} {skill.name}
                        {skill.demandScore && (
                          <span className="ats-skill-demand">{skill.demandScore}</span>
                        )}
                      </span>
                    ))}
                    {missing.map(skill => (
                      <span
                        key={skill.id || skill.name}
                        className="ats-skill-badge missing"
                        title="Missing from resume"
                      >
                        ○ {skill.name}
                        {skill.demandScore && (
                          <span className="ats-skill-demand">{skill.demandScore}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ));
          })()}

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span><span style={{ color: 'var(--ats-score-good)' }}>●</span> Matched</span>
            <span><span style={{ color: 'var(--ats-score-inferred)' }}>⚡</span> Inferred</span>
            <span><span style={{ color: 'var(--ats-score-poor)' }}>○</span> Missing</span>
          </div>
        </div>
      )}

      {/* ── Achievement Quality Heatmap ───────────────────── */}
      {achievementAnalysis && achievementAnalysis.bullets && achievementAnalysis.bullets.length > 0 && (
        <div className="ats-achievement-section">
          <h2 className="ats-section-title">
            🏆 Achievement Quality Analysis
            <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>
              Avg: {achievementAnalysis.averageQuality?.toFixed(1) || '0.0'}/10
            </span>
          </h2>

          <div className="ats-achievement-list">
            {achievementAnalysis.bullets
              .sort((a, b) => b.qualityScore - a.qualityScore)
              .slice(0, 15)
              .map((bullet, i) => (
                <div className="ats-achievement-item" key={i}>
                  <div className="ats-achievement-text">
                    {bullet.text?.length > 120
                      ? bullet.text.substring(0, 117) + '...'
                      : bullet.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="ats-achievement-bar" style={{ flex: 1 }}>
                      <div
                        className="ats-achievement-bar-fill"
                        style={{
                          width: `${(bullet.qualityScore / 10) * 100}%`,
                          background: `linear-gradient(90deg, ${getScoreColor(bullet.qualityScore * 10)}, ${getScoreColor(Math.min(100, bullet.qualityScore * 12))})`,
                        }}
                      />
                    </div>
                    <span
                      className="ats-achievement-score"
                      style={{ color: getScoreColor(bullet.qualityScore * 10) }}
                    >
                      {bullet.qualityScore?.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="ats-achievement-tags">
                    {bullet.hasActionVerb && bullet.action && (
                      <span className="ats-achievement-tag action">⚡ {bullet.action}</span>
                    )}
                    {bullet.hasQuantification && bullet.impact && (
                      <span className="ats-achievement-tag metric">📊 {bullet.impact}</span>
                    )}
                    {bullet.hasTechnicalContext && bullet.method && (
                      <span className="ats-achievement-tag method">🔧 {bullet.method}</span>
                    )}
                    {bullet.hasBusinessImpact && (
                      <span className="ats-achievement-tag impact">💰 Business Impact</span>
                    )}
                    {bullet.difficulty && bullet.difficulty !== 'Low' && (
                      <span className="ats-achievement-tag action">🎯 {bullet.difficulty}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── AI Deep Analysis (Optional) ───────────────────── */}
      <div className="ats-ai-section">
        <button
          className="ats-ai-btn"
          onClick={runAiAnalysis}
          disabled={aiLoading || !jobDescription.trim()}
        >
          {aiLoading ? (
            <>
              <span className="ats-ai-loading" />
              Analyzing...
            </>
          ) : (
            <>✨ AI Deep Analysis (Gemini)</>
          )}
        </button>
        {!localStorage.getItem('gemini_api_key') && (
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Set your Gemini API Key in Settings to enable AI analysis
          </div>
        )}

        {aiResults && (
          <div className="ats-ai-results">
            {aiResults.recruiter && (
              <div className="ats-ai-persona-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="ats-ai-persona-avatar">🔍</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Recruiter</div>
                    <div style={{ color: getScoreColor(aiResults.recruiter.score), fontWeight: 700, fontSize: '1.25rem' }}>
                      {aiResults.recruiter.score}%
                    </div>
                  </div>
                </div>
                <div className="ats-ai-persona-verdict">
                  {aiResults.recruiter.reasoning}
                </div>
              </div>
            )}
            {aiResults.hiringManager && (
              <div className="ats-ai-persona-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="ats-ai-persona-avatar" style={{ background: '#06b6d4' }}>👔</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Hiring Manager</div>
                    <div style={{ color: getScoreColor(aiResults.hiringManager.score), fontWeight: 700, fontSize: '1.25rem' }}>
                      {aiResults.hiringManager.score}%
                    </div>
                  </div>
                </div>
                <div className="ats-ai-persona-verdict">
                  {aiResults.hiringManager.reasoning}
                </div>
              </div>
            )}
            {aiResults.techLead && (
              <div className="ats-ai-persona-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="ats-ai-persona-avatar" style={{ background: '#10b981' }}>⚙️</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Tech Lead</div>
                    <div style={{ color: getScoreColor(aiResults.techLead.score), fontWeight: 700, fontSize: '1.25rem' }}>
                      {aiResults.techLead.score}%
                    </div>
                  </div>
                </div>
                <div className="ats-ai-persona-verdict">
                  {aiResults.techLead.reasoning}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

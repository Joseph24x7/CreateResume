import { useState, useMemo } from 'react'
import useResumeStore from '../../store/resumeStore'

// ── NLP & ALGORITHM DATA STRUCTURES ──
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'it', 'its', 'this',
  'that', 'these', 'those', 'we', 'our', 'you', 'your', 'they', 'their', 'he',
  'his', 'she', 'her', 'i', 'my', 'me'
])

const PROSE_NOISE_WORDS = new Set([
  'using', 'based', 'support', 'applications', 'development', 'services',
  'systems', 'implement', 'develop', 'frameworks', 'engineering', 'building',
  'working', 'work', 'experience', 'responsibilities', 'qualifications',
  'requirements', 'strong', 'proven', 'candidate', 'preferred', 'plus',
  'year', 'years', 'team', 'teams', 'role', 'project', 'projects', 'solution',
  'solutions', 'tool', 'tools', 'technology', 'technologies', 'software',
  'code', 'high', 'fast', 'good', 'new', 'key', 'well', 'help', 'provide',
  'ensure', 'include', 'includes', 'including', 'must', 'need', 'needed',
  'want', 'looking', 'seeking', 'ability', 'knowledge', 'understanding',
  'level', 'levels', 'part', 'parts', 'best', 'practices', 'process',
  'processes', 'method', 'methods', 'approach', 'approaches', 'written',
  'verbal', 'communication', 'skills', 'skill', 'degree', 'field', 'industry',
  'domain', 'business', 'value', 'user', 'users', 'customer', 'customers',
  'client', 'clients', 'management', 'manager', 'member', 'members', 'duty',
  'duties', 'task', 'tasks', 'job', 'description', 'details', 'application',
  'service', 'system', 'framework', 'engineer', 'developer', 'architecture',
  'architect', 'design', 'designed', 'built', 'created', 'maintained'
])

const ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'optimized', 'developed',
  'implemented', 'designed', 'constructed', 'accelerated', 'automated',
  'launched', 'refactored', 'maximized', 'scaled', 'delivered', 'revamped',
  'managed', 'led', 'built', 'created', 'directed', 'orchestrated',
  'pioneered', 'expanded', 'overhauled', 'reduced', 'increased', 'achieved',
  'improved', 'solved', 'mentored', 'integrated'
])

const TECH_TAXONOMY = new Set([
  'microservices', 'java', 'backend', 'frontend', 'fullstack', 'python',
  'javascript', 'typescript', 'c++', 'c#', 'golang', 'go', 'rust', 'ruby',
  'php', 'swift', 'kotlin', 'scala', 'sql', 'nosql', 'react', 'angular',
  'vue', 'next.js', 'node', 'nodejs', 'express', 'spring', 'spring boot',
  'django', 'flask', 'fastapi', '.net', 'dotnet', 'graphql', 'rest api',
  'restful', 'kafka', 'rabbitmq', 'aws', 'azure', 'gcp', 'docker',
  'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'git', 'github', 'gitlab',
  'linux', 'bash', 'redis', 'mongodb', 'postgresql', 'mysql', 'oracle',
  'elasticsearch', 'dynamodb', 'agile', 'scrum', 'jira', 'unit testing',
  'integration testing', 'jest', 'junit', 'cypress', 'selenium', 'system design',
  'object oriented', 'design patterns', 'cloud architecture', 'devops',
  'machine learning', 'data science', 'ai', 'deep learning', 'nlp', 'security',
  'oauth', 'jwt', 'html', 'css', 'tailwind', 'sass', 'bootstrap', 'webpack',
  'vite', 'maven', 'gradle', 'npm', 'yarn', 'pnpm', 'red hat', 'openstack',
  'monitoring', 'prometheus', 'grafana', 'ci cd', 'rest', 'api', 'apis',
  'cloud', 'database', 'databases', 'orm', 'hibernate', 'jpa', 'jdbc',
  'data structures', 'algorithms', 'oop', 'mvc', 'tdd', 'bdd', 'serverless',
  'lambda', 's3', 'ec2', 'ecs', 'eks', 'gke', 'aks', 'helm', 'ansible',
  'puppet', 'chef', 'vault', 'consul', 'istio', 'envoy', 'grpc', 'protobuf',
  'swagger', 'openapi', 'websockets', 'pwa', 'spa', 'ssr', 'redux', 'mobx',
  'zustand', 'recoil', 'rxjs', 'storybook', 'babel', 'es6', 'json', 'xml',
  'yaml', 'apache', 'nginx', 'tomcat', 'jetty', 'netty', 'weblogic',
  'memcached', 'solr', 'cassandra', 'hbase', 'neo4j', 'influxdb', 'couchdb',
  'mariadb', 'sqlite', 'snowflake', 'bigquery', 'redshift', 'databricks',
  'spark', 'hadoop', 'hive', 'flink', 'kafka streams', 'airflow', 'dbt',
  'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
  'opencv', 'spacy', 'nltk', 'bert', 'llm', 'rag', 'langchain', 'transformers',
  'huggingface', 'onnx', 'cuda', 'tableau', 'power bi', 'looker', 'metabase',
  'etl', 'elt', 'data warehouse', 'data lake', 'data pipeline',
  'salesforce', 'hubspot', 'sap', 'workday', 'figma', 'ui', 'ux'
])

/**
 * Filter function checking if a token is a legitimate technical or domain skill keyword.
 */
function isHighValueKeyword(token) {
  if (!token || token.length < 3) return false
  if (STOP_WORDS.has(token) || PROSE_NOISE_WORDS.has(token) || ACTION_VERBS.has(token)) {
    return false
  }
  if (TECH_TAXONOMY.has(token)) return true
  // If it's not a generic prose word and is an alphanumeric term, keep it
  return /^[a-z0-9\+\#\.\-]+$/i.test(token)
}

/**
 * Tokenization Algorithm: Converts text into a frequency map of high-value skill keywords & n-grams.
 */
function tokenizeText(text) {
  if (!text) return { tfMap: new Map(), uniqueTokens: new Set() }

  const cleanText = text.toLowerCase().replace(/[^a-z0-9\+\#\.\-\s]/g, ' ')
  const words = cleanText.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w))

  const tfMap = new Map()
  const uniqueTokens = new Set()

  // Unigrams filter
  words.forEach(w => {
    if (isHighValueKeyword(w)) {
      tfMap.set(w, (tfMap.get(w) || 0) + 1)
      uniqueTokens.add(w)
    }
  })

  // Bi-grams (to capture phrases like 'spring boot', 'system design', 'rest api')
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`
    if (TECH_TAXONOMY.has(bigram) || (isHighValueKeyword(words[i]) && isHighValueKeyword(words[i + 1]))) {
      tfMap.set(bigram, (tfMap.get(bigram) || 0) + 1.5) // Weighted higher for multi-word phrases
      uniqueTokens.add(bigram)
    }
  }

  return { tfMap, uniqueTokens }
}

/**
 * Cosine Similarity Algorithm: Vector Dot Product over Vector Magnitudes.
 */
function calculateCosineSimilarity(tf1, tf2) {
  let dotProduct = 0
  let mag1Sq = 0
  let mag2Sq = 0

  tf1.forEach((freq1, token) => {
    mag1Sq += freq1 * freq1
    if (tf2.has(token)) {
      dotProduct += freq1 * tf2.get(token)
    }
  })

  tf2.forEach(freq2 => {
    mag2Sq += freq2 * freq2
  })

  if (mag1Sq === 0 || mag2Sq === 0) return 0
  return dotProduct / (Math.sqrt(mag1Sq) * Math.sqrt(mag2Sq))
}

/**
 * Jaccard Index Algorithm: Intersection over Union of Token Sets.
 */
function calculateJaccardIndex(set1, set2) {
  if (set1.size === 0 || set2.size === 0) return 0

  let intersectionCount = 0
  set1.forEach(token => {
    if (set2.has(token)) intersectionCount++
  })

  const unionSize = set1.size + set2.size - intersectionCount
  return unionSize > 0 ? intersectionCount / unionSize : 0
}

export default function ATSCheckerWorkspace() {
  const resume = useResumeStore((s) => s.resume)
  const [jobDescription, setJobDescription] = useState('')

  // Compute ATS Audit using NLP & DS Algorithms
  const analysis = useMemo(() => {
    if (!resume || !resume.data) {
      return {
        score: 0,
        criteria: [],
        fixes: [],
        suggestions: [],
        verbRatio: 0,
        metricRatio: 0,
        keywordsMatch: null
      }
    }

    const { personalInfo = {}, summary = '', experiences = [], skillCategories = [], educations = [] } = resume.data
    const criteria = []
    const fixes = []
    const suggestions = []

    // 1. Contact Information Vector (Max 15 pts)
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
    else missingContact.push('GitHub/Portfolio')

    criteria.push({ name: 'Contact Information', score: contactPts, max: 15 })
    if (missingContact.length > 0) {
      fixes.push(`Add missing contact info: ${missingContact.join(', ')}.`)
    }

    // 2. Summary Density Analysis (Max 10 pts)
    const summaryWords = summary ? summary.trim().split(/\s+/).length : 0
    let summaryPts = 0
    if (summaryWords >= 25 && summaryWords <= 90) summaryPts = 10
    else if (summaryWords > 0) summaryPts = 5

    criteria.push({ name: 'Professional Summary', score: summaryPts, max: 10 })
    if (summaryPts === 0) {
      fixes.push('Add a 30–80 word Professional Summary to help ATS parsers classify your profile.')
    } else if (summaryPts === 5) {
      suggestions.push('Expand your summary slightly (target 30–80 words) to enrich key role competencies.')
    }

    // 3. Experience Impact & Action Verbs Analysis (Max 30 pts)
    let expPts = 0
    let totalBullets = 0
    let actionVerbCount = 0
    let metricBulletCount = 0

    // Metric pattern regex: % percentages, $ amounts, numbers with multipliers/units
    const metricRegex = /\b(\d+%\b|\$\d+|\d+x\b|\d+\+?\s*(users|clients|ms|sec|min|hours|days|percent|k|m|b))\b/i

    if (experiences.length > 0) {
      expPts += 10 // base presence
      experiences.forEach(e => {
        if (e.achievements) {
          e.achievements.forEach(ach => {
            if (!ach.trim()) return
            totalBullets++
            const firstWord = ach.trim().toLowerCase().split(/\s+/)[0]
            if (ACTION_VERBS.has(firstWord)) {
              actionVerbCount++
            }
            if (metricRegex.test(ach)) {
              metricBulletCount++
            }
          })
        }
      })

      const verbRatio = totalBullets > 0 ? actionVerbCount / totalBullets : 0
      const metricRatio = totalBullets > 0 ? metricBulletCount / totalBullets : 0

      if (verbRatio >= 0.5) expPts += 10
      else if (verbRatio >= 0.25) expPts += 5

      if (metricRatio >= 0.3) expPts += 10
      else if (metricRatio >= 0.15) expPts += 5

      if (actionVerbCount < 3) {
        fixes.push('Begin experience bullet points with strong Action Verbs (e.g., Spearheaded, Engineered, Optimized).')
      }
      if (metricBulletCount === 0) {
        suggestions.push('Include quantifiable metrics (e.g. "reduced latency by 35%", "scaled to 10k users") in your work experience.')
      }
    } else {
      fixes.push('Include at least one Work Experience section with bullet point achievements.')
    }

    criteria.push({ name: 'Work History & Impact', score: expPts, max: 30 })

    // 4. Skills Categorization (Max 20 pts)
    let skillPts = 0
    if (skillCategories.length >= 3) skillPts = 20
    else if (skillCategories.length > 0) skillPts = 10

    criteria.push({ name: 'Skills & Domain Mapping', score: skillPts, max: 20 })
    if (skillCategories.length === 0) {
      fixes.push('Create structured Skills categories to match ATS technical filters.')
    }

    // 5. Education & Formatting Structure (Max 25 pts)
    let eduPts = 0
    if (educations.length > 0) {
      eduPts += 15
      const hasFormattedEdu = educations.some(e => e.degree && e.institution)
      if (hasFormattedEdu) eduPts += 10
    }

    criteria.push({ name: 'Education & Structural Format', score: eduPts, max: 25 })
    if (educations.length === 0) {
      fixes.push('Add your Education credentials (Degree, Institution).')
    }

    const structuralScore = contactPts + summaryPts + expPts + skillPts + eduPts
    const verbRatioPct = totalBullets > 0 ? Math.round((actionVerbCount / totalBullets) * 100) : 0
    const metricRatioPct = totalBullets > 0 ? Math.round((metricBulletCount / totalBullets) * 100) : 0

    // 6. Vector Similarity & Keyword Match (Cosine Similarity + Jaccard Index)
    let finalScore = structuralScore
    let keywordsMatch = null

    if (jobDescription.trim().length > 15) {
      const resumeSerialized = JSON.stringify(resume.data)
      const resumeTokenObj = tokenizeText(resumeSerialized)
      const jdTokenObj = tokenizeText(jobDescription)

      const cosSim = calculateCosineSimilarity(resumeTokenObj.tfMap, jdTokenObj.tfMap)
      const jaccardIdx = calculateJaccardIndex(resumeTokenObj.uniqueTokens, jdTokenObj.uniqueTokens)

      // Weighted Skill Keyword Similarity Rate
      const rawMatch = (0.7 * cosSim + 0.3 * jaccardIdx) * 100
      const scaledMatchRate = Math.min(100, Math.max(10, Math.round(rawMatch * 3.2)))

      // Composite Score: 60% Structural Quality + 40% Target JD Skill Keyword Alignment
      finalScore = Math.min(100, Math.round(0.6 * structuralScore + 0.4 * scaledMatchRate))

      // Extract present vs missing high-frequency skill keywords
      const present = []
      const missing = []

      // Rank JD keywords by frequency and taxonomy relevance
      const sortedJdTokens = Array.from(jdTokenObj.tfMap.entries())
        .sort((a, b) => {
          const scoreA = (TECH_TAXONOMY.has(a[0]) ? 3 : 1) * a[1]
          const scoreB = (TECH_TAXONOMY.has(b[0]) ? 3 : 1) * b[1]
          return scoreB - scoreA
        })
        .map(([t]) => t)

      sortedJdTokens.forEach(token => {
        if (resumeTokenObj.tfMap.has(token)) {
          if (!present.includes(token)) present.push(token)
        } else {
          if (!missing.includes(token)) missing.push(token)
        }
      })

      keywordsMatch = {
        matchRate: scaledMatchRate,
        cosineSim: (cosSim * 100).toFixed(1),
        jaccardSim: (jaccardIdx * 100).toFixed(1),
        present: present.slice(0, 15),
        missing: missing.slice(0, 15)
      }
    }

    return {
      score: finalScore,
      criteria,
      fixes,
      suggestions,
      verbRatio: verbRatioPct,
      metricRatio: metricRatioPct,
      keywordsMatch
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
          flex-shrink: 0;
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
        .algo-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        .algo-metric-card {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .algo-metric-title {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .algo-metric-val {
          font-size: 18px;
          font-weight: 700;
          color: #38bdf8;
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
        .check-icon-yellow {
          color: #f59e0b;
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
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .kw-badge.present {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .kw-badge.missing {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      `}</style>

      <div className="ats-panel-left">
        <div className="ats-header">
          <div className="score-circle-wrapper">
            <span className="score-circle-text">{analysis.score}%</span>
          </div>
          <div className="score-label">
            <h3>ATS Compliance Audit</h3>
            <span>Skill Taxonomy & Vector Overlap Analysis.</span>
          </div>
        </div>

        <div className="algo-metrics-grid">
          <div className="algo-metric-card">
            <span className="algo-metric-title">Action Verb Coverage</span>
            <span className="algo-metric-val">{analysis.verbRatio}%</span>
          </div>
          <div className="algo-metric-card">
            <span className="algo-metric-title">Quantifiable Impact</span>
            <span className="algo-metric-val">{analysis.metricRatio}%</span>
          </div>
        </div>

        <div className="criteria-list" style={{ marginTop: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            Structural Criteria Weighting
          </h4>
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
            <span className="check-icon-red">⚠️</span> Prioritized Recommendations
          </h3>
          <div className="checklist">
            {analysis.fixes.map((f, i) => (
              <div className="check-item" key={`fix-${i}`}>
                <span className="check-icon-red">✕</span>
                <span>{f}</span>
              </div>
            ))}
            {analysis.suggestions.map((s, i) => (
              <div className="check-item" key={`sug-${i}`}>
                <span className="check-icon-yellow">💡</span>
                <span>{s}</span>
              </div>
            ))}
            {analysis.fixes.length === 0 && analysis.suggestions.length === 0 && (
              <div className="check-item">
                <span className="check-icon-green">✓</span>
                <span style={{ color: '#10b981' }}>
                  Excellent! Your resume passes all core structural & impact ATS benchmarks.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">📊 Technical Skill Keyword Scanner</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px 0' }}>
            Paste your target Job Description to extract genuine technical competencies & domain skills.
          </p>
          <textarea
            className="jd-textarea"
            placeholder="Paste Job Description / Requirements details..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          {analysis.keywordsMatch && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#cbd5e1' }}>
                  Technical Skill Match Score
                </span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0284c7' }}>
                  {analysis.keywordsMatch.matchRate}%
                </span>
              </div>

              <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', background: '#0284c7', width: `${analysis.keywordsMatch.matchRate}%` }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
                <span>Skill Vector Cosine: <strong style={{ color: '#cbd5e1' }}>{analysis.keywordsMatch.cosineSim}%</strong></span>
                <span>Jaccard Overlap: <strong style={{ color: '#cbd5e1' }}>{analysis.keywordsMatch.jaccardSim}%</strong></span>
              </div>

              {analysis.keywordsMatch.present.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
                    Matched Technical Skills
                  </span>
                  <div className="kw-badge-grid">
                    {analysis.keywordsMatch.present.map((kw, i) => (
                      <span className="kw-badge present" key={i}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.keywordsMatch.missing.length > 0 && (
                <div>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
                    Missing High-Value JD Technical Skills
                  </span>
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

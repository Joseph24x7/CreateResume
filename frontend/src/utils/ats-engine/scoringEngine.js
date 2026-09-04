/**
 * ═══════════════════════════════════════════════════════════════
 *  Multi-Dimensional Scoring Engine (Learning-to-Rank)
 *  ───────────────────────────────────────────────────────────
 *  Central orchestrator that calls all analyzer modules,
 *  computes 10 dimension scores, and produces a final
 *  Interview Probability with confidence interval.
 *
 *  Architecture:
 *    Resume + JD → Feature Engineering → Multi-Agent Scoring
 *    → Learning-to-Rank Aggregation → Interview Probability
 * ═══════════════════════════════════════════════════════════════
 */

import {
  findSkill,
  inferSkillsFromContext,
  getMatchedAndMissingSkills,
  calculateDemandScore,
  SKILL_ONTOLOGY,
  CATEGORY_TREE,
} from './skillOntology.js';

import {
  analyzeSkillDepths,
  getOverallTechnicalDepth,
} from './depthClassifier.js';

import {
  analyzeAllAchievements,
} from './achievementAnalyzer.js';

import {
  analyzeCareer,
} from './careerAnalyzer.js';

import {
  matchResponsibilities,
} from './responsibilityMatcher.js';

import {
  calculateIndustryAlignment,
  detectIndustries,
} from './industryDetector.js';

import {
  analyzeProjectComplexity,
} from './projectComplexity.js';

import {
  analyzeResumeQuality,
} from './resumeQuality.js';

import {
  generateAllExplanations,
  explainLeadership,
} from './explainability.js';


// ── Dimension Weights (Learning-to-Rank Feature Weights) ─────

const DIMENSION_WEIGHTS = {
  'Skill Confidence':       0.18,
  'Experience Relevance':   0.15,
  'Technical Depth':        0.12,
  'Achievement Quality':    0.10,
  'Career Progression':     0.08,
  'Industry Alignment':     0.08,
  'Project Complexity':     0.07,
  'Responsibility Coverage':0.10,
  'Leadership Evidence':    0.05,
  'Resume Quality':         0.07,
};

// ── Dimension Icons ──────────────────────────────────────────

const DIMENSION_ICONS = {
  'Skill Confidence':       '🎯',
  'Experience Relevance':   '💼',
  'Technical Depth':        '🔬',
  'Achievement Quality':    '🏆',
  'Career Progression':     '📈',
  'Industry Alignment':     '🏭',
  'Project Complexity':     '🏗️',
  'Responsibility Coverage':'✅',
  'Leadership Evidence':    '👥',
  'Resume Quality':         '📄',
};


// ── Tokenizer (shared utility) ───────────────────────────────

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','if','because','as','until','while',
  'of','at','by','for','with','about','against','between','into','through',
  'during','before','after','above','below','to','from','up','down','in',
  'out','on','off','over','under','again','further','then','once','here',
  'there','when','where','why','how','all','any','both','each','few',
  'more','most','other','some','such','no','nor','not','only','own',
  'same','so','than','too','very','s','t','can','will','just','don',
  'should','now','is','are','was','were','be','been','being','have',
  'has','had','having','do','does','did','doing','it','its','this',
  'that','these','those','we','our','you','your','they','their','he',
  'his','she','her','i','my','me',
]);

function tokenize(text) {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\-\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
  );
}

function textToString(resumeData) {
  if (!resumeData) return '';
  const parts = [];

  // Summary
  if (resumeData.summary) parts.push(resumeData.summary);

  // Skills
  (resumeData.skillCategories || []).forEach(sc => {
    if (sc.category) parts.push(sc.category);
    if (sc.skills) parts.push(sc.skills);
  });

  // Experiences
  (resumeData.experiences || []).forEach(exp => {
    if (exp.role) parts.push(exp.role);
    if (exp.company) parts.push(exp.company);
    if (exp.project) parts.push(exp.project);
    (exp.achievements || []).forEach(a => {
      if (a) parts.push(a);
    });
  });

  // Achievements
  (resumeData.achievements || []).forEach(a => {
    if (a.text) parts.push(a.text);
  });

  // Education
  (resumeData.educations || []).forEach(ed => {
    if (ed.degree) parts.push(ed.degree);
    if (ed.institution) parts.push(ed.institution);
  });

  return parts.join(' ');
}


// ── Leadership Score Calculator ──────────────────────────────

function calculateLeadershipScore(experiences) {
  if (!experiences || experiences.length === 0) return 0;

  const leadershipVerbs = new Set([
    'led','managed','mentored','directed','supervised','coordinated',
    'oversaw','guided','coached','trained','delegated','spearheaded',
    'headed','championed','established','founded','drove',
  ]);

  let leadershipBullets = 0;
  let totalBullets = 0;
  let hasLeaderTitle = false;
  let maxTeamSize = 0;

  experiences.forEach(exp => {
    const titleLower = (exp.role || '').toLowerCase();
    if (/\b(lead|manager|director|head|principal|staff|vp|chief)\b/.test(titleLower)) {
      hasLeaderTitle = true;
    }

    (exp.achievements || []).forEach(bullet => {
      if (!bullet) return;
      totalBullets++;
      const words = bullet.toLowerCase().split(/\s+/);
      if (words.some(w => leadershipVerbs.has(w))) {
        leadershipBullets++;
      }

      const teamMatch = bullet.match(/\b(\d+)\s*(developers?|engineers?|members?|people|reports?|team)/i);
      if (teamMatch) {
        maxTeamSize = Math.max(maxTeamSize, parseInt(teamMatch[1], 10));
      }
    });
  });

  let score = 0;
  if (hasLeaderTitle) score += 30;
  if (totalBullets > 0) {
    score += Math.min((leadershipBullets / totalBullets) * 40, 40);
  }
  if (maxTeamSize >= 10) score += 20;
  else if (maxTeamSize >= 5) score += 15;
  else if (maxTeamSize >= 2) score += 10;

  // Bonus for cross-functional mentions
  const fullText = experiences
    .flatMap(e => e.achievements || [])
    .join(' ')
    .toLowerCase();
  if (/cross[- ]?functional|cross[- ]?team|stakeholder/i.test(fullText)) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}


// ── Skill Confidence Score ───────────────────────────────────

function calculateSkillConfidence(resumeTokens, jdTokens, resumeText, jdText) {
  const skillAnalysis = getMatchedAndMissingSkills(resumeTokens, jdTokens);

  // Also get inferred skills from context
  const inferredResume = inferSkillsFromContext(resumeText);
  const inferredJd = inferSkillsFromContext(jdText);

  // Add inferred skills to the analysis
  inferredResume.forEach(skillId => {
    const skill = SKILL_ONTOLOGY[skillId];
    if (skill && !skillAnalysis.matched.some(s => s.id === skillId)) {
      // Check if this inferred skill is in JD
      if (jdTokens.has(skill.name.toLowerCase()) ||
          inferredJd.has(skillId) ||
          (skill.aliases || []).some(a => jdTokens.has(a))) {
        skillAnalysis.matched.push({
          ...skill,
          inferred: true,
        });
      }
    }
  });

  // Inferred JD skills that are missing
  inferredJd.forEach(skillId => {
    const skill = SKILL_ONTOLOGY[skillId];
    if (skill &&
        !skillAnalysis.matched.some(s => s.id === skillId) &&
        !skillAnalysis.missing.some(s => s.id === skillId)) {
      if (!resumeTokens.has(skill.name.toLowerCase()) &&
          !inferredResume.has(skillId)) {
        skillAnalysis.missing.push({
          ...skill,
          inferred: true,
        });
      }
    }
  });

  // Calculate score
  const totalJdSkills = skillAnalysis.matched.length + skillAnalysis.missing.length;
  if (totalJdSkills === 0) return { score: 50, analysis: skillAnalysis };

  const matchedDemandWeighted = skillAnalysis.matched
    .reduce((sum, s) => sum + (s.demandScore || 50), 0);
  const totalDemandWeighted = totalJdSkills > 0
    ? [...skillAnalysis.matched, ...skillAnalysis.missing]
        .reduce((sum, s) => sum + (s.demandScore || 50), 0)
    : 1;

  const rawScore = (matchedDemandWeighted / totalDemandWeighted) * 100;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return { score, analysis: skillAnalysis };
}


// ═══════════════════════════════════════════════════════════════
//  MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Run the complete multi-dimensional ATS analysis.
 *
 * @param {Object} resumeData - Resume data from Zustand store
 * @param {string} jobDescription - Job description text
 * @returns {Object} Complete analysis results
 */
export function runFullAnalysis(resumeData, jobDescription) {
  if (!resumeData) {
    return getEmptyAnalysis();
  }

  const hasJD = jobDescription && jobDescription.trim().length > 20;

  // ── Step 1: Text extraction and tokenization ───────────────
  const resumeText = textToString(resumeData);
  const resumeTokens = tokenize(resumeText);
  const jdTokens = hasJD ? tokenize(jobDescription) : new Set();

  // ── Step 2: Run all analyzers ──────────────────────────────

  // 2a. Skill Confidence
  const { score: skillScore, analysis: skillAnalysis } = hasJD
    ? calculateSkillConfidence(resumeTokens, jdTokens, resumeText, jobDescription)
    : { score: 50, analysis: { matched: [], missing: [], categories: {} } };

  // 2b. Technical Depth
  const depthMap = analyzeSkillDepths(resumeData.experiences || []);
  const technicalDepthScore = getOverallTechnicalDepth(depthMap);

  // 2c. Achievement Quality
  const achievementAnalysis = analyzeAllAchievements(resumeData.experiences || []);
  const achievementScore = Math.min(100, Math.round(achievementAnalysis.averageQuality * 10));

  // 2d. Career Progression
  const careerAnalysis = analyzeCareer(resumeData.experiences || []);
  const careerScore = careerAnalysis.growthScore;

  // 2e. Responsibility Coverage
  const responsibilityAnalysis = hasJD
    ? matchResponsibilities(jobDescription, resumeData.experiences || [])
    : { matches: [], coverageScore: 50, avgSimilarity: 0.5, strongMatches: 0, weakMatches: 0, unmatchedRequirements: [] };
  const responsibilityCoverageScore = Math.round(responsibilityAnalysis.coverageScore);

  // 2f. Industry Alignment
  const industryAnalysis = hasJD
    ? calculateIndustryAlignment(resumeText, jobDescription)
    : { score: 50, resumeIndustries: detectIndustries(resumeText), jdIndustries: [], alignment: 'N/A', explanation: '' };
  const industryScore = industryAnalysis.score;

  // 2g. Project Complexity
  const complexityAnalysis = analyzeProjectComplexity(resumeData.experiences || []);
  const projectComplexityScore = complexityAnalysis.overallScore;

  // 2h. Leadership Evidence
  const leadershipScore = calculateLeadershipScore(resumeData.experiences || []);

  // 2i. Resume Quality
  const qualityAnalysis = analyzeResumeQuality(resumeData);
  const resumeQualityScore = qualityAnalysis.score;

  // 2j. Experience Relevance (composite of responsibility + skill overlap)
  const experienceRelevanceScore = hasJD
    ? Math.round(responsibilityCoverageScore * 0.6 + skillScore * 0.4)
    : 50;

  // ── Step 3: Assemble dimension scores ──────────────────────

  const dimensionScores = {
    'Skill Confidence': skillScore,
    'Experience Relevance': experienceRelevanceScore,
    'Technical Depth': technicalDepthScore,
    'Achievement Quality': achievementScore,
    'Career Progression': careerScore,
    'Industry Alignment': industryScore,
    'Project Complexity': projectComplexityScore,
    'Responsibility Coverage': responsibilityCoverageScore,
    'Leadership Evidence': leadershipScore,
    'Resume Quality': resumeQualityScore,
  };

  // ── Step 4: Generate explanations ──────────────────────────

  const explanations = generateAllExplanations({
    skillAnalysis,
    responsibilityAnalysis,
    depthMap,
    achievementAnalysis,
    careerAnalysis,
    industryAnalysis,
    complexityAnalysis,
    experiences: resumeData.experiences || [],
    qualityAnalysis,
  });

  // ── Step 5: Learning-to-Rank Aggregation ───────────────────

  let interviewProbability = 0;
  const scores = [];

  Object.entries(DIMENSION_WEIGHTS).forEach(([dim, weight]) => {
    const score = dimensionScores[dim] || 0;
    interviewProbability += score * weight;
    scores.push(score);
  });

  interviewProbability = Math.min(100, Math.max(0, Math.round(interviewProbability)));

  // Confidence interval based on score variance
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const confidenceInterval = Math.min(15, Math.max(2, Math.round(stdDev / 4)));

  // ── Step 6: Persona simulations (rule-based) ───────────────

  // Recruiter: focuses on keywords and formatting
  const recruiterScore = Math.round(
    skillScore * 0.40 + resumeQualityScore * 0.30 + responsibilityCoverageScore * 0.30
  );

  // Hiring Manager: focuses on experience relevance and career
  const hiringManagerScore = Math.round(
    experienceRelevanceScore * 0.30 + careerScore * 0.25 +
    achievementScore * 0.25 + leadershipScore * 0.20
  );

  // Tech Lead: focuses on technical depth and project complexity
  const techLeadScore = Math.round(
    technicalDepthScore * 0.35 + projectComplexityScore * 0.25 +
    skillScore * 0.25 + achievementScore * 0.15
  );

  // ── Step 7: Build dimensions array for UI ──────────────────

  const dimensions = Object.entries(DIMENSION_WEIGHTS).map(([name, weight]) => ({
    name,
    icon: DIMENSION_ICONS[name],
    score: dimensionScores[name],
    weight,
    explanation: explanations[name] || { positives: [], negatives: [], recommendations: [] },
  }));

  // Sort by weight descending for display priority
  dimensions.sort((a, b) => b.weight - a.weight);

  return {
    interviewProbability,
    confidenceInterval,
    hasJD,
    dimensions,
    personas: {
      recruiter: { label: 'Recruiter', score: recruiterScore, icon: '🔍' },
      hiringManager: { label: 'Hiring Manager', score: hiringManagerScore, icon: '👔' },
      techLead: { label: 'Tech Lead', score: techLeadScore, icon: '⚙️' },
    },
    skillAnalysis,
    responsibilityMatches: responsibilityAnalysis.matches || [],
    achievementAnalysis: {
      bullets: achievementAnalysis.bullets || [],
      averageQuality: achievementAnalysis.averageQuality,
      topBullets: achievementAnalysis.topBullets || [],
      weakBullets: achievementAnalysis.weakBullets || [],
    },
    careerAnalysis,
    industryAnalysis,
    complexityAnalysis,
    qualityAnalysis,
    depthMap,
  };
}


// ── Empty analysis (no resume data) ──────────────────────────

function getEmptyAnalysis() {
  const emptyExplanation = { positives: [], negatives: [], recommendations: [] };
  return {
    interviewProbability: 0,
    confidenceInterval: 0,
    hasJD: false,
    dimensions: Object.entries(DIMENSION_WEIGHTS).map(([name, weight]) => ({
      name,
      icon: DIMENSION_ICONS[name],
      score: 0,
      weight,
      explanation: emptyExplanation,
    })),
    personas: {
      recruiter: { label: 'Recruiter', score: 0, icon: '🔍' },
      hiringManager: { label: 'Hiring Manager', score: 0, icon: '👔' },
      techLead: { label: 'Tech Lead', score: 0, icon: '⚙️' },
    },
    skillAnalysis: { matched: [], missing: [], categories: {} },
    responsibilityMatches: [],
    achievementAnalysis: { bullets: [], averageQuality: 0, topBullets: [], weakBullets: [] },
    careerAnalysis: { growthScore: 0, titleProgression: [], currentSeniority: { level: 0, label: 'N/A' }, avgTenureMonths: 0, promotionVelocity: 'N/A', companyTiers: [], totalExperienceYears: 0, flags: {}, explanation: { positives: [], negatives: [] } },
    industryAnalysis: { score: 0, resumeIndustries: [], jdIndustries: [], alignment: 'N/A', explanation: '' },
    complexityAnalysis: { projects: [], averageComplexity: 0, maxComplexity: 0, overallScore: 0 },
    qualityAnalysis: { score: 0, breakdown: {}, positives: [], negatives: [], recommendations: [] },
    depthMap: new Map(),
  };
}

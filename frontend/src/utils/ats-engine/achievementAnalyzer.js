/**
 * achievementAnalyzer.js
 * Achievement Quality Analyzer — extracts structured components from bullet points.
 */

const ACTION_VERBS = [
  "architected", "spearheaded", "engineered", "optimized", "developed", "implemented", "designed", "constructed", "accelerated", "automated", "launched", "refactored", "maximized", "scaled", "delivered", "revamped", "managed", "led", "built", "created", "directed", "orchestrated", "pioneered", "expanded", "overhauled", "reduced", "increased", "achieved", "improved", "solved", "mentored", "integrated", "migrated", "transformed", "consolidated", "streamlined", "deployed", "containerized", "modernized", "parallelized", "decoupled", "centralized", "standardized", "debugged", "resolved", "analyzed", "negotiated", "collaborated", "established", "introduced"
];

const METRIC_REGEXES = [
  /\b(\d+\.?\d*)\s*(%|percent)\b/i,
  /\$\s*(\d+\.?\d*)(k|m|b|K|M|B)?/i,
  /\b(\d+\.?\d*)x\b/i,
  /\b(\d+\.?\d*)\s*(users|clients|customers|requests|transactions|queries|ms|seconds|minutes|hours|apis|endpoints|services|microservices|developers|engineers|teams|servers|nodes|regions|countries)/i
];

const BUSINESS_TERMS = ["revenue", "cost", "efficiency", "customer", "user", "retention", "conversion", "uptime", "sla", "profit"];
const TECH_TERMS = ["api", "database", "server", "cloud", "framework", "architecture", "algorithm", "model", "pipeline", "infrastructure"];

export function analyzeBullet(bulletText) {
  if (!bulletText) {
    return {
      text: '', action: null, metric: null, impact: null, method: null, difficulty: 'Low', qualityScore: 0, hasQuantification: false, hasActionVerb: false, hasTechnicalContext: false, hasBusinessImpact: false
    };
  }

  const text = bulletText;
  const lowerText = text.toLowerCase();
  
  let action = null;
  let hasActionVerb = false;
  for (const verb of ACTION_VERBS) {
    if (lowerText.startsWith(verb) || lowerText.includes(` ${verb} `)) {
      action = verb;
      hasActionVerb = true;
      break;
    }
  }

  let metric = null;
  let impact = null;
  let hasQuantification = false;
  for (const regex of METRIC_REGEXES) {
    const match = text.match(regex);
    if (match) {
      impact = match[0];
      metric = match[2] || 'multiplier'; 
      hasQuantification = true;
      break;
    }
  }

  let method = null;
  let hasTechnicalContext = false;
  for (const tech of TECH_TERMS) {
    if (lowerText.includes(tech)) {
      method = tech;
      hasTechnicalContext = true;
      break;
    }
  }

  let hasBusinessImpact = false;
  for (const term of BUSINESS_TERMS) {
    if (lowerText.includes(term)) {
      hasBusinessImpact = true;
      break;
    }
  }

  let qualityScore = 0;
  if (hasActionVerb) qualityScore += 3;
  if (hasQuantification) qualityScore += 3;
  if (hasTechnicalContext) qualityScore += 2;
  if (hasBusinessImpact) qualityScore += 2;

  let difficulty = 'Low';
  if (qualityScore >= 8) difficulty = 'Very High';
  else if (qualityScore >= 6) difficulty = 'High';
  else if (qualityScore >= 4) difficulty = 'Medium';

  // Specific check for magnitude
  if (impact && impact.includes('%') && parseFloat(impact) > 50) {
      difficulty = 'High';
  }

  return {
    text, action, metric, impact, method, difficulty, qualityScore, hasQuantification, hasActionVerb, hasTechnicalContext, hasBusinessImpact
  };
}

export function analyzeAllAchievements(experiences) {
  if (!experiences || !Array.isArray(experiences)) return null;

  const bullets = [];
  experiences.forEach(exp => {
    if (exp.achievements && Array.isArray(exp.achievements)) {
      exp.achievements.forEach(b => bullets.push(analyzeBullet(b)));
    }
  });

  if (bullets.length === 0) {
      return { bullets: [], averageQuality: 0, quantificationRatio: 0, actionVerbRatio: 0, verbDiversity: 0, topBullets: [], weakBullets: [] };
  }

  const totalQuality = bullets.reduce((sum, b) => sum + b.qualityScore, 0);
  const quantified = bullets.filter(b => b.hasQuantification).length;
  const verbCount = bullets.filter(b => b.hasActionVerb).length;
  const uniqueVerbs = new Set(bullets.map(b => b.action).filter(Boolean)).size;

  const sortedBullets = [...bullets].sort((a, b) => b.qualityScore - a.qualityScore);

  return {
    bullets,
    averageQuality: totalQuality / bullets.length,
    quantificationRatio: quantified / bullets.length,
    actionVerbRatio: verbCount / bullets.length,
    verbDiversity: uniqueVerbs / (verbCount || 1),
    topBullets: sortedBullets.slice(0, 5),
    weakBullets: sortedBullets.slice(-5).reverse()
  };
}

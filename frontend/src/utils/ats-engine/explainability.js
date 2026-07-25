/**
 * ═══════════════════════════════════════════════════════════════
 *  Explainability Engine
 *  ───────────────────────────────────────────────────────────
 *  Generates human-readable reasoning for every scoring
 *  dimension. Every score has a reason — no black box.
 *
 *  Each dimension produces:
 *    { positives: [{ text, impact }], negatives: [{ text, impact }], recommendations: [] }
 * ═══════════════════════════════════════════════════════════════
 */

// ── Skill Confidence Explanations ────────────────────────────

export function explainSkillConfidence(skillAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!skillAnalysis) return { positives, negatives, recommendations };

  const { matched = [], missing = [], categories = {} } = skillAnalysis;

  // Group matched skills by category for readable output
  const categoryMatches = {};
  matched.forEach(s => {
    const cat = s.category || 'Other';
    if (!categoryMatches[cat]) categoryMatches[cat] = [];
    categoryMatches[cat].push(s.name);
  });

  Object.entries(categoryMatches).forEach(([cat, skills]) => {
    if (skills.length >= 3) {
      positives.push({
        text: `Strong ${cat} coverage (${skills.slice(0, 4).join(', ')}${skills.length > 4 ? ` +${skills.length - 4} more` : ''})`,
        impact: Math.min(skills.length * 3, 15),
      });
    } else if (skills.length > 0) {
      positives.push({
        text: `${cat}: ${skills.join(', ')}`,
        impact: skills.length * 2,
      });
    }
  });

  // High-demand missing skills
  const highDemandMissing = missing
    .filter(s => s.demandScore >= 80)
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 5);

  highDemandMissing.forEach(s => {
    negatives.push({
      text: `Missing ${s.name} (high demand in JD)`,
      impact: -Math.round(s.demandScore / 20),
    });
    recommendations.push(`Add ${s.name} experience if applicable`);
  });

  // Lower-demand missing
  const lowerMissing = missing
    .filter(s => s.demandScore < 80)
    .slice(0, 3);
  lowerMissing.forEach(s => {
    negatives.push({
      text: `Missing ${s.name} (mentioned in JD)`,
      impact: -2,
    });
  });

  if (matched.length === 0 && missing.length > 0) {
    negatives.push({
      text: 'No JD skill keywords matched in resume',
      impact: -20,
    });
    recommendations.push('Review the job description and align your skills section');
  }

  return { positives, negatives, recommendations };
}

// ── Experience Relevance Explanations ────────────────────────

export function explainExperienceRelevance(responsibilityAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!responsibilityAnalysis) return { positives, negatives, recommendations };

  const { strongMatches = 0, weakMatches = 0, coverageScore = 0, matches = [] } = responsibilityAnalysis;

  if (strongMatches >= 3) {
    positives.push({
      text: `${strongMatches} JD requirements strongly matched (≥70% similarity)`,
      impact: Math.min(strongMatches * 4, 16),
    });
  } else if (strongMatches > 0) {
    positives.push({
      text: `${strongMatches} JD requirement(s) with strong match`,
      impact: strongMatches * 3,
    });
  }

  if (coverageScore >= 80) {
    positives.push({
      text: `Excellent requirement coverage (${Math.round(coverageScore)}%)`,
      impact: 10,
    });
  } else if (coverageScore >= 50) {
    positives.push({
      text: `Moderate requirement coverage (${Math.round(coverageScore)}%)`,
      impact: 5,
    });
  }

  if (weakMatches > 0) {
    negatives.push({
      text: `${weakMatches} JD requirement(s) with weak/no match`,
      impact: -Math.min(weakMatches * 3, 12),
    });

    const unmatched = matches
      .filter(m => m.score < 0.4)
      .slice(0, 3);
    unmatched.forEach(m => {
      const req = m.requirement.length > 60
        ? m.requirement.substring(0, 57) + '...'
        : m.requirement;
      recommendations.push(`Address JD requirement: "${req}"`);
    });
  }

  return { positives, negatives, recommendations };
}

// ── Technical Depth Explanations ─────────────────────────────

export function explainTechnicalDepth(depthMap) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!depthMap || depthMap.size === 0) {
    negatives.push({
      text: 'No technical depth signals detected',
      impact: -15,
    });
    recommendations.push('Use specific technical verbs: "designed", "architected", "optimized"');
    return { positives, negatives, recommendations };
  }

  const entries = Array.from(depthMap.entries());
  const expertSkills = entries.filter(([, v]) => v.level >= 4);
  const advancedSkills = entries.filter(([, v]) => v.level === 3);
  const basicSkills = entries.filter(([, v]) => v.level === 1);

  if (expertSkills.length > 0) {
    positives.push({
      text: `Expert-level depth in ${expertSkills.map(([k]) => k).slice(0, 3).join(', ')}`,
      impact: expertSkills.length * 5,
    });
  }

  if (advancedSkills.length >= 2) {
    positives.push({
      text: `Advanced proficiency in ${advancedSkills.map(([k]) => k).slice(0, 4).join(', ')}`,
      impact: advancedSkills.length * 3,
    });
  }

  if (basicSkills.length > entries.length * 0.5 && entries.length > 2) {
    negatives.push({
      text: `${basicSkills.length} of ${entries.length} skills show only basic-level usage`,
      impact: -8,
    });
    recommendations.push('Replace "used X" with specific achievements using that technology');
  }

  return { positives, negatives, recommendations };
}

// ── Achievement Quality Explanations ─────────────────────────

export function explainAchievementQuality(achievementAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!achievementAnalysis) return { positives, negatives, recommendations };

  const {
    averageQuality = 0,
    quantificationRatio = 0,
    actionVerbRatio = 0,
    verbDiversity = 0,
    topBullets = [],
    weakBullets = [],
  } = achievementAnalysis;

  if (quantificationRatio >= 0.4) {
    positives.push({
      text: `${Math.round(quantificationRatio * 100)}% of bullets have quantifiable metrics`,
      impact: 10,
    });
  } else if (quantificationRatio >= 0.2) {
    positives.push({
      text: `${Math.round(quantificationRatio * 100)}% of bullets have metrics`,
      impact: 5,
    });
    recommendations.push('Add more numbers: %, $, x multipliers, user counts');
  } else {
    negatives.push({
      text: `Only ${Math.round(quantificationRatio * 100)}% of bullets have quantifiable metrics`,
      impact: -10,
    });
    recommendations.push('Quantify your achievements — "Reduced latency by X%", "Saved $Y", "Served Z users"');
  }

  if (actionVerbRatio >= 0.7) {
    positives.push({
      text: `${Math.round(actionVerbRatio * 100)}% bullets start with strong action verbs`,
      impact: 8,
    });
  } else if (actionVerbRatio < 0.4) {
    negatives.push({
      text: `Only ${Math.round(actionVerbRatio * 100)}% bullets start with action verbs`,
      impact: -6,
    });
    recommendations.push('Start bullets with action verbs: "Architected", "Optimized", "Delivered"');
  }

  if (verbDiversity >= 0.8) {
    positives.push({
      text: 'Excellent verb diversity — varied action verbs throughout',
      impact: 4,
    });
  } else if (verbDiversity < 0.5) {
    negatives.push({
      text: 'Repetitive action verbs — same verbs used across bullets',
      impact: -4,
    });
    recommendations.push('Vary your action verbs — avoid repeating the same verb');
  }

  if (topBullets.length > 0 && topBullets[0].qualityScore >= 8) {
    positives.push({
      text: `Top bullet scores ${topBullets[0].qualityScore.toFixed(1)}/10 — strong impact statement`,
      impact: 5,
    });
  }

  if (weakBullets.length > 0 && weakBullets[0].qualityScore < 3) {
    negatives.push({
      text: `${weakBullets.filter(b => b.qualityScore < 3).length} bullet(s) score below 3/10 — generic descriptions`,
      impact: -5,
    });
    recommendations.push('Rewrite weak bullets with the STAR format: Situation → Task → Action → Result');
  }

  return { positives, negatives, recommendations };
}

// ── Career Progression Explanations ──────────────────────────

export function explainCareerProgression(careerAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!careerAnalysis) return { positives, negatives, recommendations };

  const {
    flags = {},
    currentSeniority = {},
    totalExperienceYears = 0,
    promotionVelocity = 'Average',
    companyTiers = [],
  } = careerAnalysis;

  if (flags.upwardTrajectory) {
    positives.push({
      text: 'Clear upward career trajectory — consistent promotions',
      impact: 12,
    });
  }

  if (currentSeniority.level >= 5) {
    positives.push({
      text: `Current seniority: ${currentSeniority.label} (Level ${currentSeniority.level}/9)`,
      impact: 8,
    });
  }

  const topTierCompanies = companyTiers.filter(c =>
    c.tier === 'FAANG' || c.tier === 'Fortune500'
  );
  if (topTierCompanies.length > 0) {
    positives.push({
      text: `Experience at top-tier companies: ${topTierCompanies.map(c => c.company).join(', ')}`,
      impact: topTierCompanies.length * 4,
    });
  }

  if (totalExperienceYears >= 5) {
    positives.push({
      text: `${totalExperienceYears.toFixed(1)} years of professional experience`,
      impact: Math.min(Math.round(totalExperienceYears * 1.5), 12),
    });
  } else if (totalExperienceYears < 2) {
    negatives.push({
      text: `Limited professional experience (${totalExperienceYears.toFixed(1)} years)`,
      impact: -5,
    });
  }

  if (promotionVelocity === 'Fast') {
    positives.push({
      text: 'Fast promotion velocity — above-average career acceleration',
      impact: 6,
    });
  }

  if (flags.jobHopping) {
    negatives.push({
      text: 'Job hopping pattern detected — average tenure under 12 months',
      impact: -8,
    });
    recommendations.push('Consider consolidating short roles or explaining transitions');
  }

  if (flags.stagnation) {
    negatives.push({
      text: 'Career stagnation — same title level for extended period',
      impact: -6,
    });
    recommendations.push('Highlight any informal leadership or scope expansion');
  }

  return { positives, negatives, recommendations };
}

// ── Industry Alignment Explanations ──────────────────────────

export function explainIndustryAlignment(industryAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!industryAnalysis) return { positives, negatives, recommendations };

  const {
    alignment = 'None',
    resumeIndustries = [],
    jdIndustries = [],
    score = 0,
  } = industryAnalysis;

  if (alignment === 'Strong') {
    const shared = resumeIndustries
      .filter(ri => jdIndustries.some(ji => ji.id === ri.id))
      .map(ri => ri.name);
    positives.push({
      text: `Strong industry alignment: ${shared.join(', ')}`,
      impact: 12,
    });
  } else if (alignment === 'Partial') {
    positives.push({
      text: 'Partial industry overlap with the target role',
      impact: 5,
    });
  } else if (alignment === 'Weak' || alignment === 'None') {
    if (jdIndustries.length > 0) {
      negatives.push({
        text: `No industry overlap — JD targets ${jdIndustries[0].name}`,
        impact: -8,
      });
      recommendations.push(`Highlight any transferable domain experience related to ${jdIndustries[0].name}`);
    }
  }

  if (resumeIndustries.length > 0 && resumeIndustries[0].confidence >= 80) {
    positives.push({
      text: `Deep domain expertise in ${resumeIndustries[0].name} (${Math.round(resumeIndustries[0].confidence)}% confidence)`,
      impact: 6,
    });
  }

  return { positives, negatives, recommendations };
}

// ── Project Complexity Explanations ──────────────────────────

export function explainProjectComplexity(complexityAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!complexityAnalysis) return { positives, negatives, recommendations };

  const { projects = [], averageComplexity = 0, maxComplexity = 0 } = complexityAnalysis;

  const highComplexity = projects.filter(p => p.complexityScore >= 70);
  const lowComplexity = projects.filter(p => p.complexityScore < 30);

  if (highComplexity.length > 0) {
    highComplexity.slice(0, 2).forEach(p => {
      const label = p.project || p.company || p.role;
      positives.push({
        text: `High-complexity project: ${label} (${p.complexityScore}/100)`,
        impact: Math.round(p.complexityScore / 12),
      });
    });
  }

  if (maxComplexity >= 80) {
    positives.push({
      text: 'Experience with highly complex systems (distributed, large-scale)',
      impact: 8,
    });
  }

  if (averageComplexity < 30 && projects.length > 0) {
    negatives.push({
      text: 'Projects appear relatively simple — limited complexity indicators',
      impact: -6,
    });
    recommendations.push('Describe system scale, architecture patterns, and technical challenges');
  }

  if (projects.length === 0) {
    negatives.push({
      text: 'No project complexity signals detected',
      impact: -10,
    });
    recommendations.push('Add details about system architecture, scale, and technical decisions');
  }

  return { positives, negatives, recommendations };
}

// ── Leadership Evidence Explanations ─────────────────────────

export function explainLeadership(experiences) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!experiences || experiences.length === 0) {
    return { positives, negatives, recommendations };
  }

  const leadershipVerbs = new Set([
    'led', 'managed', 'mentored', 'directed', 'supervised', 'coordinated',
    'oversaw', 'guided', 'coached', 'trained', 'delegated', 'spearheaded',
    'headed', 'championed', 'established', 'founded', 'drove',
  ]);

  const teamPatterns = [
    /\b(\d+)\s*(developers?|engineers?|members?|people|reports?|team)/i,
    /\bcross[- ]?functional/i,
    /\bcross[- ]?team/i,
    /\bstakeholder/i,
    /\bmentor/i,
  ];

  let leadershipBullets = 0;
  let teamSizeMentions = [];
  let totalBullets = 0;

  experiences.forEach(exp => {
    (exp.achievements || []).forEach(bullet => {
      totalBullets++;
      const words = bullet.toLowerCase().split(/\s+/);

      if (words.some(w => leadershipVerbs.has(w))) {
        leadershipBullets++;
      }

      teamPatterns.forEach(pat => {
        const match = bullet.match(pat);
        if (match && match[1]) {
          teamSizeMentions.push(parseInt(match[1], 10));
        }
      });
    });

    // Check title for leadership signals
    const titleLower = (exp.role || '').toLowerCase();
    if (/\b(lead|manager|director|head|principal|staff|vp|chief)\b/.test(titleLower)) {
      positives.push({
        text: `Leadership title: ${exp.role}`,
        impact: 6,
      });
    }
  });

  if (leadershipBullets >= 3) {
    positives.push({
      text: `${leadershipBullets} leadership-oriented bullet points`,
      impact: 8,
    });
  } else if (leadershipBullets > 0) {
    positives.push({
      text: `${leadershipBullets} leadership mention(s)`,
      impact: leadershipBullets * 2,
    });
  }

  if (teamSizeMentions.length > 0) {
    const maxTeam = Math.max(...teamSizeMentions);
    positives.push({
      text: `Managed/led teams of up to ${maxTeam} people`,
      impact: Math.min(Math.round(maxTeam / 2), 8),
    });
  }

  if (leadershipBullets === 0 && totalBullets > 5) {
    negatives.push({
      text: 'No leadership or mentoring evidence in bullet points',
      impact: -5,
    });
    recommendations.push('Highlight any mentoring, code reviews, or team coordination');
  }

  return { positives, negatives, recommendations };
}

// ── Resume Quality Explanations ──────────────────────────────

export function explainResumeQuality(qualityAnalysis) {
  const positives = [];
  const negatives = [];
  const recommendations = [];

  if (!qualityAnalysis) return { positives, negatives, recommendations };

  const { breakdown = {}, score = 0 } = qualityAnalysis;

  Object.values(breakdown).forEach(section => {
    if (!section) return;
    if (section.score >= section.max * 0.8) {
      // Good section — add as positive
      (section.details || []).filter(d => !d.startsWith('Missing') && !d.startsWith('No ')).forEach(d => {
        positives.push({ text: d, impact: 3 });
      });
    } else if (section.score < section.max * 0.5) {
      // Weak section — add as negative
      (section.details || []).filter(d => d.startsWith('Missing') || d.startsWith('No ') || d.includes('too')).forEach(d => {
        negatives.push({ text: d, impact: -3 });
      });
    }
  });

  if (score >= 85) {
    positives.push({
      text: 'Resume is well-structured and ATS-optimized',
      impact: 5,
    });
  } else if (score < 50) {
    negatives.push({
      text: 'Resume structure needs significant improvement',
      impact: -8,
    });
    recommendations.push('Ensure all sections are complete: Contact, Summary, Skills, Experience, Education');
  }

  return {
    positives: positives.slice(0, 5),
    negatives: negatives.slice(0, 5),
    recommendations: [...new Set([...recommendations, ...(qualityAnalysis.recommendations || [])])].slice(0, 5),
  };
}

// ── Master Explanation Aggregator ────────────────────────────

/**
 * Generate comprehensive explanations for all dimensions.
 * Called by the scoring engine after all analyzers have run.
 *
 * @param {Object} analysisResults - Results from all analyzer modules
 * @returns {Object} Map of dimension name → { positives, negatives, recommendations }
 */
export function generateAllExplanations(analysisResults) {
  const {
    skillAnalysis,
    responsibilityAnalysis,
    depthMap,
    achievementAnalysis,
    careerAnalysis,
    industryAnalysis,
    complexityAnalysis,
    experiences,
    qualityAnalysis,
  } = analysisResults;

  return {
    'Skill Confidence': explainSkillConfidence(skillAnalysis),
    'Experience Relevance': explainExperienceRelevance(responsibilityAnalysis),
    'Technical Depth': explainTechnicalDepth(depthMap),
    'Achievement Quality': explainAchievementQuality(achievementAnalysis),
    'Career Progression': explainCareerProgression(careerAnalysis),
    'Industry Alignment': explainIndustryAlignment(industryAnalysis),
    'Project Complexity': explainProjectComplexity(complexityAnalysis),
    'Leadership Evidence': explainLeadership(experiences),
    'Responsibility Coverage': explainExperienceRelevance(responsibilityAnalysis),
    'Resume Quality': explainResumeQuality(qualityAnalysis),
  };
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  Standalone Lightweight NLP ATS Engine
 *  ───────────────────────────────────────────────────────────
 *  - Tokenization & Noise Filtering: `keyword-extractor`
 *  - Root Stemming: Browser-Safe Porter Stemmer Algorithm
 *  - Fuzzy Matching: Jaro-Winkler Distance Algorithm
 *  - Vectorization: TF-IDF Frequency Matching
 * ═══════════════════════════════════════════════════════════════
 */

import keywordExtractor from 'keyword-extractor';

// Domain prose noise filter
const DOMAIN_NOISE_WORDS = new Set([
  'experience', 'responsibilities', 'qualifications', 'requirements', 'candidate',
  'preferred', 'plus', 'year', 'years', 'team', 'teams', 'role', 'project', 'projects',
  'solution', 'solutions', 'tool', 'tools', 'technology', 'technologies', 'software',
  'code', 'high', 'fast', 'good', 'new', 'key', 'well', 'help', 'provide', 'ensure',
  'include', 'includes', 'including', 'must', 'need', 'needed', 'want', 'looking',
  'seeking', 'ability', 'knowledge', 'understanding', 'level', 'levels', 'part',
  'parts', 'best', 'practices', 'process', 'processes', 'method', 'methods',
  'approach', 'approaches', 'written', 'verbal', 'communication', 'skills', 'skill',
  'degree', 'field', 'industry', 'domain', 'business', 'value', 'user', 'users',
  'customer', 'customers', 'client', 'clients', 'management', 'manager', 'member',
  'members', 'duty', 'duties', 'task', 'tasks', 'job', 'description', 'details',
  'application', 'applications', 'service', 'services', 'system', 'systems',
  'framework', 'frameworks', 'engineer', 'developer', 'architecture', 'architect',
  'design', 'designed', 'built', 'created', 'maintained', 'using', 'based', 'support',
  'development', 'engineering', 'building', 'working', 'work', 'implement', 'develop'
]);

/**
 * Lightweight Porter Stemmer Algorithm
 */
function porterStem(word) {
  if (!word || word.length < 3) return word;
  let w = word.toLowerCase();

  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies')) w = w.slice(0, -2);
  else if (w.endsWith('ss')) w = w;
  else if (w.endsWith('s')) w = w.slice(0, -1);

  if (w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.endsWith('ment')) w = w.slice(0, -4);
  else if (w.endsWith('ation')) w = w.slice(0, -5) + 'e';
  else if (w.endsWith('tional')) w = w.slice(0, -6) + 'tion';

  return w;
}

/**
 * Lightweight Jaro-Winkler Distance Algorithm
 */
function jaroWinkler(s1, s2) {
  if (s1 === s2) return 1.0;
  const l1 = s1.length, l2 = s2.length;
  if (l1 === 0 || l2 === 0) return 0.0;

  const matchWindow = Math.floor(Math.max(l1, l2) / 2) - 1;
  const s1Matches = new Array(l1).fill(false);
  const s2Matches = new Array(l2).fill(false);

  let matches = 0;
  let trans = 0;

  for (let i = 0; i < l1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, l2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < l1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) trans++;
    k++;
  }

  const jaro = (matches / l1 + matches / l2 + (matches - trans / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, l1, l2); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Extract clean keywords from text using `keyword-extractor`
 */
export function extractCleanKeywords(text) {
  if (!text || typeof text !== 'string') return [];

  const rawKeywords = keywordExtractor.extract(text, {
    language: 'english',
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: false,
  });

  return rawKeywords.filter((word) => {
    const cleanWord = word.toLowerCase().trim();
    if (cleanWord.length < 3) return false;
    if (DOMAIN_NOISE_WORDS.has(cleanWord)) return false;
    if (/^\d+$/.test(cleanWord)) return false;
    return true;
  });
}

/**
 * Perform Standalone NLP ATS Analysis
 */
export function analyzeResumeATS(resumeData, jobDescriptionText) {
  const resumeText = buildResumeText(resumeData);
  const hasJD = Boolean(jobDescriptionText && jobDescriptionText.trim().length > 15);

  const resumeKeywords = extractCleanKeywords(resumeText);
  const jdKeywords = hasJD ? extractCleanKeywords(jobDescriptionText) : [];

  // Build JD frequency map
  const jdFrequencyMap = {};
  jdKeywords.forEach((word) => {
    jdFrequencyMap[word] = (jdFrequencyMap[word] || 0) + 1;
  });

  const uniqueJdKeywords = Object.keys(jdFrequencyMap).sort(
    (a, b) => jdFrequencyMap[b] - jdFrequencyMap[a]
  );

  // Resume stem set and word set
  const resumeStems = new Set(resumeKeywords.map(porterStem));
  const resumeWordSet = new Set(resumeKeywords.map((w) => w.toLowerCase()));

  const matchedList = [];
  const missingList = [];

  uniqueJdKeywords.forEach((jdWord) => {
    const stem = porterStem(jdWord);
    const frequency = jdFrequencyMap[jdWord];

    let isMatched = resumeWordSet.has(jdWord);

    if (!isMatched) {
      isMatched = resumeStems.has(stem);
    }

    if (!isMatched) {
      for (const resWord of resumeWordSet) {
        if (jaroWinkler(jdWord, resWord) > 0.88) {
          isMatched = true;
          break;
        }
      }
    }

    const item = {
      name: jdWord,
      stem: stem,
      frequency: frequency,
    };

    if (isMatched) {
      matchedList.push(item);
    } else {
      missingList.push(item);
    }
  });

  // Calculate TF-IDF match score
  let tfidfScore = 0;
  if (hasJD && uniqueJdKeywords.length > 0) {
    let matchCount = 0;
    matchedList.forEach((item) => {
      matchCount += item.frequency;
    });

    const totalJdWordCount = jdKeywords.length || 1;
    tfidfScore = Math.min(100, Math.round((matchCount / totalJdWordCount) * 100));
  }

  // Structural score
  const structuralScore = calculateStructuralScore(resumeData);

  // Final score
  let finalScore = 0;
  if (hasJD) {
    finalScore = Math.round(0.35 * structuralScore + 0.65 * tfidfScore);
  } else {
    finalScore = structuralScore;
  }

  const suggestions = generateSuggestions(resumeData, missingList, hasJD);

  return {
    score: Math.min(100, Math.max(10, finalScore)),
    hasJD,
    matchedKeywords: matchedList,
    missingKeywords: missingList,
    structuralScore,
    suggestions,
  };
}

/**
 * Structural completeness score (0-100)
 */
function calculateStructuralScore(resumeData) {
  if (!resumeData) return 20;

  let score = 0;
  const pi = resumeData.personalInfo || {};

  if (pi.email) score += 5;
  if (pi.phone) score += 5;
  if (pi.location) score += 5;
  if (pi.linkedin || pi.github) score += 5;

  if (resumeData.summary && resumeData.summary.trim().split(/\s+/).length >= 25) {
    score += 20;
  } else if (resumeData.summary) {
    score += 10;
  }

  const exps = resumeData.experiences || [];
  if (exps.length > 0) {
    score += 15;
    let bulletCount = 0;
    let metricCount = 0;
    exps.forEach((e) => {
      (e.achievements || []).forEach((a) => {
        bulletCount++;
        if (/\b(\d+%\b|\$\d+|\d+x\b|\d+\+?\s*(users|clients|ms|sec|hours|k|m|b))\b/i.test(a)) {
          metricCount++;
        }
      });
    });
    if (bulletCount > 0 && metricCount / bulletCount >= 0.3) {
      score += 15;
    } else if (bulletCount > 0) {
      score += 8;
    }
  }

  const skills = resumeData.skillCategories || [];
  if (skills.length >= 2) score += 15;
  else if (skills.length === 1) score += 8;

  const edus = resumeData.educations || [];
  if (edus.length > 0) score += 15;

  return Math.min(100, score);
}

/**
 * Generate actionable suggestions
 */
function generateSuggestions(resumeData, missingKeywords, hasJD) {
  const list = [];

  if (hasJD && missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 5).map((k) => k.name).join(', ');
    list.push(`Add missing JD keywords to your skills or experience: ${topMissing}`);
  }

  const pi = resumeData?.personalInfo || {};
  if (!pi.linkedin) {
    list.push('Add LinkedIn profile URL to your contact info for better ATS reach.');
  }

  if (!resumeData?.summary || resumeData.summary.trim().split(/\s+/).length < 25) {
    list.push('Expand professional summary to at least 30-50 words containing key role terms.');
  }

  const exps = resumeData?.experiences || [];
  let hasMetrics = false;
  exps.forEach((e) => {
    (e.achievements || []).forEach((a) => {
      if (/\b(\d+%\b|\$\d+|\d+x\b)\b/i.test(a)) hasMetrics = true;
    });
  });

  if (!hasMetrics && exps.length > 0) {
    list.push('Quantify your experience bullet points with numbers, percentages (%), or dollar amounts.');
  }

  if (list.length === 0) {
    list.push('Your resume formatting, contact details, and keyword coverage are fully optimized!');
  }

  return list;
}

/**
 * Build single string from resume data
 */
function buildResumeText(data) {
  if (!data) return '';
  const parts = [];

  if (data.summary) parts.push(data.summary);

  (data.skillCategories || []).forEach((sc) => {
    if (sc.category) parts.push(sc.category);
    if (sc.skills) parts.push(sc.skills);
  });

  (data.experiences || []).forEach((exp) => {
    if (exp.role) parts.push(exp.role);
    if (exp.company) parts.push(exp.company);
    if (exp.project) parts.push(exp.project);
    (exp.achievements || []).forEach((a) => {
      if (a) parts.push(a);
    });
  });

  (data.educations || []).forEach((ed) => {
    if (ed.degree) parts.push(ed.degree);
    if (ed.institution) parts.push(ed.institution);
  });

  return parts.join(' ');
}

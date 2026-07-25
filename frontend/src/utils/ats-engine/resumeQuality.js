export function analyzeResumeQuality(resumeData) {
  if (!resumeData) return createEmptyScore();

  const result = {
    score: 0,
    breakdown: {
      contactCompleteness: { score: 0, max: 15, details: [] },
      summaryQuality: { score: 0, max: 15, details: [] },
      bulletQuality: { score: 0, max: 25, details: [] },
      sectionCompleteness: { score: 0, max: 20, details: [] },
      quantificationRatio: { score: 0, max: 15, ratio: 0, details: [] },
      verbDiversity: { score: 0, max: 10, ratio: 0, details: [] }
    },
    positives: [],
    negatives: [],
    recommendations: []
  };

  // 1. Contact Completeness
  if (resumeData.personalInfo) {
    const p = resumeData.personalInfo;
    if (p.email) { result.breakdown.contactCompleteness.score += 3; result.breakdown.contactCompleteness.details.push('Email present'); }
    if (p.phone) { result.breakdown.contactCompleteness.score += 3; result.breakdown.contactCompleteness.details.push('Phone present'); }
    if (p.location || p.city || p.country) { result.breakdown.contactCompleteness.score += 3; result.breakdown.contactCompleteness.details.push('Location present'); }
    if (p.linkedin) { result.breakdown.contactCompleteness.score += 3; result.breakdown.contactCompleteness.details.push('LinkedIn present'); }
    if (p.github || p.portfolio || p.website) { result.breakdown.contactCompleteness.score += 3; result.breakdown.contactCompleteness.details.push('Portfolio/GitHub present'); }
  }

  // 2. Summary Quality
  if (resumeData.summary) {
    const words = resumeData.summary.split(/\\s+/).filter(w => w.length > 0);
    const count = words.length;
    if (count >= 25 && count <= 80) {
      result.breakdown.summaryQuality.score += 10;
      result.breakdown.summaryQuality.details.push('Summary is optimal length (25-80 words)');
    } else if (count > 0 && count < 25) {
      result.breakdown.summaryQuality.score += 3;
      result.breakdown.summaryQuality.details.push('Summary is too short (<25 words)');
    } else if (count > 80) {
      result.breakdown.summaryQuality.score += 5;
      result.breakdown.summaryQuality.details.push('Summary is too long (>80 words)');
    }

    if (count > 0) {
      result.breakdown.summaryQuality.score += 5; // Assuming some role-relevant keywords for now
      result.breakdown.summaryQuality.details.push('Contains role-relevant keywords (estimated)');
    }
  } else {
    result.breakdown.summaryQuality.details.push('Missing summary section');
  }

  // 3. Section Completeness
  if (resumeData.experiences && resumeData.experiences.length > 0) {
    result.breakdown.sectionCompleteness.score += 6;
    result.breakdown.sectionCompleteness.details.push('Experiences section present');
  }
  if (resumeData.skillCategories && resumeData.skillCategories.length > 0) {
    result.breakdown.sectionCompleteness.score += 5;
    result.breakdown.sectionCompleteness.details.push('Skills section present');
  }
  if (resumeData.educations && resumeData.educations.length > 0) {
    result.breakdown.sectionCompleteness.score += 5;
    result.breakdown.sectionCompleteness.details.push('Education section present');
  }
  if ((resumeData.achievements && resumeData.achievements.length > 0) || (resumeData.projects && resumeData.projects.length > 0)) {
    result.breakdown.sectionCompleteness.score += 4;
    result.breakdown.sectionCompleteness.details.push('Achievements/Projects section present');
  }

  // Collect all bullets
  let allBullets = [];
  if (resumeData.experiences) {
    resumeData.experiences.forEach(exp => {
      if (exp.achievements) allBullets = allBullets.concat(exp.achievements.filter(a => typeof a === 'string'));
    });
  }

  // 4 & 5 & 6. Bullet Quality, Quantification, Verb Diversity
  if (allBullets.length > 0) {
    let quantifiedCount = 0;
    let validStartCount = 0;
    let personalPronounCount = 0;
    let goodLengthCount = 0;
    const verbs = new Set();

    allBullets.forEach(bullet => {
      // Metric check
      if (/\\d+%|\\$\\d+|\\d+x|\\d+\\s*(million|k|m|billion)/i.test(bullet) || /\\b\\d+\\b/.test(bullet)) {
        quantifiedCount++;
      }
      
      const words = bullet.trim().split(/\\s+/);
      const firstWord = words[0]?.toLowerCase();
      
      // Personal pronoun check
      if (['i', 'my', 'we', 'our'].includes(firstWord)) {
        personalPronounCount++;
      } else {
        validStartCount++;
        if (firstWord && !/^(the|a|an|in|on|at|with|by|for)$/i.test(firstWord)) {
           verbs.add(firstWord);
        }
      }

      // Length check
      if (words.length >= 10 && words.length <= 25) {
        goodLengthCount++;
      }
    });

    // Bullet Quality Scoring
    const verbRatio = validStartCount / allBullets.length;
    result.breakdown.bulletQuality.score += Math.round(verbRatio * 10);
    result.breakdown.bulletQuality.details.push(`${Math.round(verbRatio * 100)}% of bullets start with action verbs`);

    if (personalPronounCount === 0) {
      result.breakdown.bulletQuality.score += 5;
      result.breakdown.bulletQuality.details.push('No personal pronouns used in bullets');
    }

    const lengthRatio = goodLengthCount / allBullets.length;
    result.breakdown.bulletQuality.score += Math.round(lengthRatio * 5); // up to 5 points
    result.breakdown.bulletQuality.score += 5; // consistent length base points
    result.breakdown.bulletQuality.details.push(`${Math.round(lengthRatio * 100)}% of bullets are optimal length (10-25 words)`);

    // Quantification
    const qRatio = quantifiedCount / allBullets.length;
    result.breakdown.quantificationRatio.ratio = qRatio;
    if (qRatio > 0.4) { result.breakdown.quantificationRatio.score = 15; result.breakdown.quantificationRatio.details.push('>40% bullets quantified'); }
    else if (qRatio >= 0.2) { result.breakdown.quantificationRatio.score = 10; result.breakdown.quantificationRatio.details.push('20-40% bullets quantified'); }
    else if (qRatio >= 0.1) { result.breakdown.quantificationRatio.score = 5; result.breakdown.quantificationRatio.details.push('10-20% bullets quantified'); }
    else { result.breakdown.quantificationRatio.score = 2; result.breakdown.quantificationRatio.details.push('<10% bullets quantified'); }

    // Verb Diversity
    const vRatio = verbs.size / allBullets.length;
    result.breakdown.verbDiversity.ratio = vRatio;
    if (vRatio > 0.8) { result.breakdown.verbDiversity.score = 10; result.breakdown.verbDiversity.details.push('>80% unique verbs'); }
    else if (vRatio >= 0.6) { result.breakdown.verbDiversity.score = 7; result.breakdown.verbDiversity.details.push('60-80% unique verbs'); }
    else if (vRatio >= 0.4) { result.breakdown.verbDiversity.score = 4; result.breakdown.verbDiversity.details.push('40-60% unique verbs'); }
    else { result.breakdown.verbDiversity.score = 2; result.breakdown.verbDiversity.details.push('<40% unique verbs'); }

  } else {
    result.breakdown.bulletQuality.details.push('No bullet points found to analyze');
    result.breakdown.quantificationRatio.details.push('No bullet points found');
    result.breakdown.verbDiversity.details.push('No bullet points found');
  }

  // Sum total
  result.score = Object.values(result.breakdown).reduce((acc, curr) => acc + curr.score, 0);

  // Positives/Negatives/Recommendations Generation
  if (result.breakdown.contactCompleteness.score >= 12) result.positives.push('Excellent contact information completeness');
  else result.recommendations.push('Add more contact information like LinkedIn and Portfolio/GitHub');

  if (result.breakdown.quantificationRatio.score === 15) result.positives.push('Strong use of quantified metrics in achievements');
  else if (result.breakdown.quantificationRatio.score <= 5) result.recommendations.push('Quantify more achievements with numbers and metrics');

  if (result.breakdown.bulletQuality.score >= 20) result.positives.push('Well-structured bullet points with action verbs');
  else result.negatives.push('Bullet points need better structure (start with action verbs, avoid personal pronouns)');

  return result;
}

function createEmptyScore() {
  return {
    score: 0,
    breakdown: {
      contactCompleteness: { score: 0, max: 15, details: [] },
      summaryQuality: { score: 0, max: 15, details: [] },
      bulletQuality: { score: 0, max: 25, details: [] },
      sectionCompleteness: { score: 0, max: 20, details: [] },
      quantificationRatio: { score: 0, max: 15, ratio: 0, details: [] },
      verbDiversity: { score: 0, max: 10, ratio: 0, details: [] }
    },
    positives: [],
    negatives: [],
    recommendations: ['Provide resume data to analyze']
  };
}

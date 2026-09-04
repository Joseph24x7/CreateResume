const STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with']);

export function extractRequirements(jdText) {
  if (!jdText) return [];
  // Split by newline or standard bullet characters
  const lines = jdText.split(/\n|•|-|\*|●|\d+\./);
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 20); // Keep meaningful sentences
}

export function extractResumeBullets(experiences) {
  if (!experiences || !Array.isArray(experiences)) return [];
  const bullets = [];
  experiences.forEach(exp => {
    if (exp && exp.achievements && Array.isArray(exp.achievements)) {
      exp.achievements.forEach(ach => {
        if (typeof ach === 'string' && ach.trim().length > 0) {
          bullets.push(ach.trim());
        }
      });
    }
  });
  return bullets;
}

export function calculateSentenceSimilarity(sentence1, sentence2) {
  if (!sentence1 || !sentence2) return 0;
  
  const tokenize = (text) => {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(token => token.length > 0 && !STOP_WORDS.has(token));
  };

  const tokens1 = tokenize(sentence1);
  const tokens2 = tokenize(sentence2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  let intersectionCount = 0;

  // Simple heuristic for technical skill: length > 3 or specific list, we'll just weight all non-stopwords equally for now, maybe add slightly more for longer words as proxy for technical terms
  set1.forEach(token => {
    if (set2.has(token)) {
      intersectionCount += token.length > 4 ? 2 : 1; // 2x weight for longer words as a simple proxy for technical skills
    }
  });

  const unionTokens = new Set([...tokens1, ...tokens2]);
  let unionWeight = 0;
  unionTokens.forEach(token => {
    unionWeight += token.length > 4 ? 2 : 1;
  });

  return unionWeight === 0 ? 0 : intersectionCount / unionWeight;
}

export function matchResponsibilities(jdText, experiences) {
  const requirements = extractRequirements(jdText);
  const bullets = extractResumeBullets(experiences);

  const matches = [];
  let strongCount = 0;
  let weakCount = 0;
  const unmatchedRequirements = [];
  let totalSimilarity = 0;
  let coverageCount = 0;

  requirements.forEach(req => {
    let bestMatch = '';
    let bestScore = 0;

    bullets.forEach(bullet => {
      const score = calculateSentenceSimilarity(req, bullet);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = bullet;
      }
    });

    if (bestScore >= 0.4) {
      coverageCount++;
    }
    
    if (bestScore >= 0.7) {
      strongCount++;
    } else if (bestScore < 0.4) {
      weakCount++;
      unmatchedRequirements.push(req);
    }

    matches.push({
      requirement: req,
      bestMatch: bestMatch,
      score: bestScore,
      matchedSkills: [] // Advanced skill matching could populate this
    });

    totalSimilarity += bestScore;
  });

  const reqLength = requirements.length || 1;
  
  return {
    matches,
    coverageScore: requirements.length ? (coverageCount / requirements.length) * 100 : 0,
    avgSimilarity: requirements.length ? totalSimilarity / requirements.length : 0,
    strongMatches: strongCount,
    weakMatches: weakCount,
    unmatchedRequirements
  };
}

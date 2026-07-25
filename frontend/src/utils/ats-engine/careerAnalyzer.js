/**
 * careerAnalyzer.js
 * Career Progression Engine — analyzes title trajectory, tenure, and growth.
 */

const SENIORITY_MAP = [
  { level: 1, titles: ['intern', 'trainee', 'apprentice', 'student'] },
  { level: 2, titles: ['junior', 'associate', 'entry', 'graduate', 'jr'] },
  { level: 3, titles: ['developer', 'engineer', 'programmer', 'analyst', 'consultant', 'specialist', 'administrator'] },
  { level: 4, titles: ['senior', 'sr', 'experienced', 'iii'] },
  { level: 5, titles: ['lead', 'staff', 'principal', 'team lead', 'tech lead'] },
  { level: 6, titles: ['architect', 'fellow', 'distinguished', 'expert'] },
  { level: 7, titles: ['manager', 'engineering manager', 'head'] },
  { level: 8, titles: ['director', 'senior director', 'vp', 'vice president'] },
  { level: 9, titles: ['cto', 'cio', 'ceo', 'chief', 'founder', 'co-founder', 'partner'] },
];

const FAANG = ["google", "apple", "amazon", "meta", "facebook", "microsoft", "netflix", "tesla", "nvidia", "openai", "deepmind", "anthropic"];
const FORTUNE_500 = ["jpmorgan", "goldman sachs", "citi", "bank of america", "visa", "mastercard", "samsung", "intel", "ibm", "oracle", "salesforce", "sap", "adobe", "uber", "airbnb", "stripe", "coinbase"];

function getSeniority(roleName) {
  if (!roleName) return { level: 3, label: 'Unknown' };
  const lowerRole = roleName.toLowerCase();
  
  for (let i = SENIORITY_MAP.length - 1; i >= 0; i--) {
    const s = SENIORITY_MAP[i];
    for (const title of s.titles) {
      if (lowerRole.includes(title)) {
        return { level: s.level, label: s.titles[0] };
      }
    }
  }
  return { level: 3, label: 'engineer' }; // default fallback
}

function getCompanyTier(companyName) {
  if (!companyName) return 'Unknown';
  const lowerName = companyName.toLowerCase();
  
  if (FAANG.some(c => lowerName.includes(c))) return 'FAANG';
  if (FORTUNE_500.some(c => lowerName.includes(c))) return 'Fortune500';
  return 'Startup';
}

function parseDate(dateStr) {
  if (!dateStr || dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
    return new Date();
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

function monthDiff(d1, d2) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

export function analyzeCareer(experiences) {
  if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
    return {
      growthScore: 0, titleProgression: [], currentSeniority: { level: 1, label: 'Unknown' },
      avgTenureMonths: 0, promotionVelocity: 'Average', companyTiers: [], totalExperienceYears: 0,
      flags: { jobHopping: false, stagnation: false, upwardTrajectory: false },
      explanation: { positives: [], negatives: [] }
    };
  }

  // Sort earliest to latest based on startDate
  const sortedExp = [...experiences].sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));
  
  let totalMonths = 0;
  const titleProgression = [];
  const companyTiers = [];
  let previousLevel = 0;
  let upwardCount = 0;
  let stagnationCount = 0;
  let hasFaangOrFortune = false;

  sortedExp.forEach(exp => {
    const start = parseDate(exp.startDate);
    const end = parseDate(exp.endDate);
    const duration = monthDiff(start, end);
    totalMonths += duration;

    const seniority = getSeniority(exp.role);
    titleProgression.push({ role: exp.role || 'Unknown', level: seniority.level, company: exp.company || 'Unknown' });
    
    const tier = getCompanyTier(exp.company);
    companyTiers.push({ company: exp.company || 'Unknown', tier });
    if (tier === 'FAANG' || tier === 'Fortune500') hasFaangOrFortune = true;

    if (previousLevel > 0 && seniority.level > previousLevel) {
      upwardCount++;
    } else if (previousLevel > 0 && seniority.level === previousLevel) {
      stagnationCount += duration;
    }
    
    previousLevel = seniority.level;
  });

  const avgTenureMonths = totalMonths / sortedExp.length;
  const totalExperienceYears = totalMonths / 12;
  
  const currentSeniority = getSeniority(sortedExp[sortedExp.length - 1].role);

  let growthScore = 50; // base score
  const flags = { jobHopping: false, stagnation: false, upwardTrajectory: false };
  const explanation = { positives: [], negatives: [] };

  if (upwardCount > 0) {
    flags.upwardTrajectory = true;
    growthScore += 25;
    explanation.positives.push("Shows clear upward trajectory in titles.");
  }
  
  if (hasFaangOrFortune) {
    growthScore += 15;
    explanation.positives.push("Experience at top-tier companies (FAANG/Fortune 500).");
  }

  if (avgTenureMonths >= 18 && avgTenureMonths <= 48) {
    growthScore += 15;
    explanation.positives.push("Healthy average tenure between 1.5 and 4 years.");
  }

  if (avgTenureMonths < 12) {
    flags.jobHopping = true;
    growthScore -= 15;
    explanation.negatives.push("Potential job hopping identified (<12 months average tenure).");
  }

  if (stagnationCount > 60) { // 5 years
    flags.stagnation = true;
    growthScore -= 10;
    explanation.negatives.push("Role stagnation: more than 5 years at the same seniority level.");
  }

  if (totalExperienceYears < 2) {
    // Base
  } else if (totalExperienceYears <= 5) {
    growthScore += 10;
  } else if (totalExperienceYears <= 10) {
    growthScore += 15;
  } else {
    growthScore += 20;
  }

  growthScore = Math.max(0, Math.min(100, growthScore));

  let promotionVelocity = 'Average';
  if (flags.upwardTrajectory && totalExperienceYears < 5 && currentSeniority.level >= 4) {
    promotionVelocity = 'Fast';
  } else if (flags.stagnation) {
    promotionVelocity = 'Slow';
  }

  return {
    growthScore,
    titleProgression,
    currentSeniority,
    avgTenureMonths,
    promotionVelocity,
    companyTiers,
    totalExperienceYears,
    flags,
    explanation
  };
}

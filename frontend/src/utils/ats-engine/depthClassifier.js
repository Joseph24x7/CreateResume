/**
 * depthClassifier.js
 * Technical Depth Classifier — classifies each skill mention's depth level from bullet points.
 */

const LEVEL_1_VERBS = ["used", "familiar with", "worked with", "exposure to", "basic knowledge", "aware of", "learning", "assisted with", "helped with"];
const LEVEL_2_VERBS = ["implemented", "developed", "built", "configured", "integrated", "wrote", "created", "deployed", "maintained", "set up", "managed", "operated", "troubleshot", "debugged", "tested"];
const LEVEL_3_VERBS = ["designed", "architected", "optimized", "scaled", "led migration", "custom", "refactored", "re-engineered", "orchestrated", "automated", "streamlined", "improved performance", "reduced latency", "increased throughput", "high availability", "fault tolerant"];
const LEVEL_4_VERBS = ["invented", "patented", "published", "benchmarked", "core contributor", "from scratch", "internals", "replication", "consensus", "open source maintainer", "spoke at", "pioneered", "novel approach", "state of the art", "zero downtime", "exactly once", "sub-millisecond"];

const LEVELS = [
  { level: 4, label: 'Expert', phrases: LEVEL_4_VERBS },
  { level: 3, label: 'Advanced', phrases: LEVEL_3_VERBS },
  { level: 2, label: 'Intermediate', phrases: LEVEL_2_VERBS },
  { level: 1, label: 'Basic', phrases: LEVEL_1_VERBS },
];

export function classifyDepth(bulletText, skillName) {
  if (!bulletText || !skillName) {
    return { level: 1, label: 'Basic', evidence: '' };
  }
  
  const text = bulletText.toLowerCase();
  const skill = skillName.toLowerCase();
  
  if (!text.includes(skill)) {
    return { level: 1, label: 'Basic', evidence: '' };
  }

  for (const { level, label, phrases } of LEVELS) {
    for (const phrase of phrases) {
      if (text.includes(phrase)) {
        return { level, label, evidence: phrase };
      }
    }
  }

  return { level: 1, label: 'Basic', evidence: 'skill mentioned' };
}

export function analyzeSkillDepths(experiences) {
  const depthMap = new Map();
  
  if (!experiences || !Array.isArray(experiences)) {
    return depthMap;
  }

  const extractSkills = (text) => {
    const common = ["JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin", "TypeScript", "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "SQL", "NoSQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Kafka", "RabbitMQ", "GraphQL", "REST", "CI/CD", "Linux"];
    return common.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
  };

  for (const exp of experiences) {
    if (exp.achievements && Array.isArray(exp.achievements)) {
      for (const bullet of exp.achievements) {
        const skills = extractSkills(bullet);
        for (const skill of skills) {
          const classification = classifyDepth(bullet, skill);
          
          const existing = depthMap.get(skill);
          if (!existing || existing.level < classification.level) {
            depthMap.set(skill, {
              ...classification,
              mentions: (existing ? existing.mentions : 0) + 1
            });
          } else if (existing) {
            existing.mentions += 1;
          }
        }
      }
    }
  }

  return depthMap;
}

export function getOverallTechnicalDepth(depthMap) {
  if (!depthMap || depthMap.size === 0) {
    return 0;
  }

  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const [skill, data] of depthMap.entries()) {
    totalScore += data.level;
    maxPossibleScore += 4; // Expert is max
  }

  if (maxPossibleScore === 0) return 0;
  return Math.round((totalScore / maxPossibleScore) * 100);
}

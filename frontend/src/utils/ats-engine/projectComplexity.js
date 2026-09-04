export function analyzeProjectComplexity(experiences) {
  if (!experiences || !Array.isArray(experiences)) {
    return {
      projects: [],
      averageComplexity: 0,
      maxComplexity: 0,
      overallScore: 0
    };
  }

  const projects = [];
  let totalScore = 0;
  let maxScore = 0;

  const complexitySignals = [
    { regex: /distributed (systems|transactions)/i, points: 15, name: 'Distributed systems' },
    { regex: /microservices?/i, points: 12, name: 'Microservices architecture' },
    { regex: /event(-| )driven|event sourcing/i, points: 10, name: 'Event-driven' },
    { regex: /cloud(-| )native/i, points: 8, name: 'Cloud-native deployment' },
    { regex: /(million(s of)? users|100\+ api|50\+ dev|global scale)/i, points: 15, name: 'High scale' },
    { regex: /high availability|fault tolerance/i, points: 10, name: 'High availability' },
    { regex: /performance optimi(z|s)ation/i, points: 8, name: 'Performance optimization' },
    { regex: /cross(-| )team|cross(-| )functional/i, points: 5, name: 'Cross-functional' },
    { regex: /real(-| )time|low(-| )latency/i, points: 8, name: 'Real-time / low-latency' },
    { regex: /security|compliance/i, points: 5, name: 'Security / compliance' },
    { regex: /data pipeline|etl/i, points: 7, name: 'Data pipeline / ETL' },
    { regex: /machine learning|ml model/i, points: 10, name: 'Machine learning' },
    { regex: /migrat(ion|e)|moderniz(ation|e)/i, points: 6, name: 'Migration / modernization' }
  ];

  experiences.forEach(exp => {
    let score = 0;
    const signals = [];
    const fullText = [
      exp.role || '',
      exp.project || '',
      ...(exp.achievements || [])
    ].join(' ');

    complexitySignals.forEach(signal => {
      if (signal.regex.test(fullText)) {
        score += signal.points;
        signals.push(signal.name);
      }
    });

    // Check multiple technology layers (simple heuristic: mention of multiple DBs, languages, etc.)
    const hasDb = /(sql|database|mongo|postgres|mysql)/i.test(fullText);
    const hasFrontend = /(react|vue|angular|frontend|ui)/i.test(fullText);
    const hasBackend = /(node|java|python|backend|api)/i.test(fullText);
    const hasInfra = /(aws|gcp|azure|docker|kubernetes)/i.test(fullText);
    
    let layers = 0;
    if (hasDb) layers++;
    if (hasFrontend) layers++;
    if (hasBackend) layers++;
    if (hasInfra) layers++;

    if (layers >= 3) {
      score += 8;
      signals.push('Multiple technology layers');
    }

    score = Math.min(score, 100); // Cap at 100

    let classification = 'Simple';
    if (score > 75) classification = 'Highly Complex';
    else if (score > 50) classification = 'Complex';
    else if (score > 25) classification = 'Moderate';

    projects.push({
      role: exp.role || 'Unknown Role',
      company: exp.company || 'Unknown Company',
      project: exp.project || '',
      complexityScore: score,
      classification,
      signals
    });

    totalScore += score;
    if (score > maxScore) maxScore = score;
  });

  const avg = projects.length > 0 ? totalScore / projects.length : 0;

  return {
    projects,
    averageComplexity: avg,
    maxComplexity: maxScore,
    overallScore: (avg + maxScore) / 2 // A balanced overall score
  };
}

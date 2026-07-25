const INDUSTRIES = {
  fintech: {
    name: 'Fintech & Payments',
    signals: ['swift', 'iso8583', 'emv', 'pci dss', 'pci-dss', 'payment', 'banking', 'ledger', 'settlement', 'clearing', 'card processing', 'merchant', 'acquirer', 'issuer', 'chargeback', 'fraud detection', 'anti-money laundering', 'aml', 'kyc', 'know your customer', 'wire transfer', 'ach', 'nacha', 'sepa', 'rtgs', 'core banking', 'loan', 'mortgage', 'credit', 'debit', 'trading', 'stock', 'forex', 'cryptocurrency', 'blockchain', 'wallet', 'finserv']
  },
  healthcare: {
    name: 'Healthcare & MedTech',
    signals: ['hipaa', 'hl7', 'fhir', 'dicom', 'ehr', 'emr', 'clinical', 'patient', 'medical', 'pharma', 'drug', 'fda', 'genomics', 'biotech', 'telemedicine', 'health insurance', 'claims processing', 'icd-10', 'cpt code', 'epic', 'cerner']
  },
  ecommerce: {
    name: 'E-Commerce & Retail',
    signals: ['cart', 'checkout', 'inventory', 'catalog', 'shopify', 'magento', 'product listing', 'order management', 'sku', 'warehouse', 'fulfillment', 'recommendation engine', 'pricing', 'marketplace', 'storefront', 'pos', 'point of sale', 'supply chain', 'logistics']
  },
  adtech: {
    name: 'AdTech & MarTech',
    signals: ['ad serving', 'rtb', 'real-time bidding', 'dsp', 'ssp', 'cpm', 'cpc', 'ctr', 'impression', 'click-through', 'attribution', 'retargeting', 'programmatic', 'campaign', 'analytics', 'a/b testing', 'conversion', 'seo', 'sem', 'google ads', 'facebook ads']
  },
  telecom: {
    name: 'Telecommunications',
    signals: ['5g', '4g', 'lte', 'voip', 'sip', 'ims', 'telecom', 'network', 'spectrum', 'bandwidth', 'oss', 'bss', 'billing system', 'cdr', 'nfv', 'sdn', 'tower', 'antenna']
  },
  gaming: {
    name: 'Gaming & Entertainment',
    signals: ['game engine', 'unity', 'unreal', 'directx', 'vulkan', 'opengl', 'shader', 'multiplayer', 'matchmaking', 'leaderboard', 'game server', 'fps', 'mmo', 'ar', 'vr', 'xr', 'metaverse', 'streaming', 'content delivery', 'cdn']
  },
  automotive: {
    name: 'Automotive & Mobility',
    signals: ['autonomous', 'self-driving', 'adas', 'lidar', 'radar', 'vehicle', 'obd', 'can bus', 'telematics', 'fleet management', 'ev', 'charging', 'ride-sharing', 'mobility']
  },
  cybersecurity: {
    name: 'Cybersecurity',
    signals: ['siem', 'soar', 'threat detection', 'intrusion', 'penetration testing', 'vulnerability', 'malware', 'ransomware', 'firewall', 'ids', 'ips', 'zero trust', 'endpoint security', 'soc', 'incident response', 'forensics', 'compliance']
  },
  edtech: {
    name: 'EdTech & Learning',
    signals: ['lms', 'learning management', 'e-learning', 'course', 'curriculum', 'student', 'enrollment', 'assessment', 'grading', 'mooc', 'edtech', 'classroom', 'tutoring']
  },
  saas: {
    name: 'SaaS & Enterprise',
    signals: ['saas', 'multi-tenant', 'subscription', 'billing', 'crm', 'erp', 'salesforce', 'hubspot', 'workday', 'sap', 'servicenow', 'zendesk', 'intercom', 'b2b', 'enterprise', 'onboarding', 'self-service']
  },
  media: {
    name: 'Media & Content',
    signals: ['cms', 'content management', 'publishing', 'editorial', 'video', 'audio', 'podcast', 'transcoding', 'drm', 'media asset', 'news', 'journalism', 'social media']
  },
  iot: {
    name: 'IoT & Edge Computing',
    signals: ['iot', 'mqtt', 'sensor', 'edge computing', 'embedded', 'firmware', 'rtos', 'raspberry pi', 'arduino', 'zigbee', 'bluetooth', 'wearable', 'smart home', 'industrial iot', 'iiot', 'scada', 'plc']
  },
  govtech: {
    name: 'Government & Defense',
    signals: ['government', 'federal', 'defense', 'military', 'classified', 'clearance', 'fedramp', 'fisma', 'nist', 'dod', 'intelligence', 'geospatial', 'gis']
  },
  insurance: {
    name: 'Insurance & InsurTech',
    signals: ['insurance', 'underwriting', 'claims', 'actuarial', 'policy', 'premium', 'reinsurance', 'insurtech', 'risk assessment', 'loss ratio']
  },
  energy: {
    name: 'Energy & Utilities',
    signals: ['energy', 'utility', 'smart grid', 'power', 'solar', 'wind', 'renewable', 'oil', 'gas', 'drilling', 'pipeline', 'metering', 'distribution']
  },
};

export function detectIndustries(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  
  const results = [];
  
  for (const [id, industry] of Object.entries(INDUSTRIES)) {
    let matches = 0;
    const matchedTerms = [];
    
    industry.signals.forEach(signal => {
      // Using word boundary matching for whole word matching when applicable
      const regex = new RegExp(`\\b${signal.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'g');
      const count = (lowerText.match(regex) || []).length;
      if (count > 0) {
        matches++;
        matchedTerms.push(signal);
      }
    });
    
    if (matches >= 2) {
      const confidence = (matches / industry.signals.length) * 100;
      results.push({
        id,
        name: industry.name,
        confidence: Math.min(confidence * 2, 100), // Scale confidence slightly
        matchedTerms
      });
    }
  }
  
  return results.sort((a, b) => b.confidence - a.confidence);
}

export function calculateIndustryAlignment(resumeText, jdText) {
  const resumeIndustries = detectIndustries(resumeText);
  const jdIndustries = detectIndustries(jdText);
  
  let score = 0;
  let alignment = 'None';
  let explanation = 'No overlapping industries detected.';
  
  if (jdIndustries.length === 0) {
    return {
      score: 100, // If JD has no specific industry, we don't penalize
      resumeIndustries,
      jdIndustries,
      alignment: 'Strong',
      explanation: 'Job description is industry-agnostic.'
    };
  }
  
  const jdIds = jdIndustries.map(i => i.id);
  const resumeIds = resumeIndustries.map(i => i.id);
  
  const commonIndustries = jdIds.filter(id => resumeIds.includes(id));
  
  if (commonIndustries.length > 0) {
    score = 100;
    alignment = 'Strong';
    explanation = `Strong alignment in ${commonIndustries.map(id => INDUSTRIES[id].name).join(', ')}.`;
  } else if (resumeIndustries.length > 0) {
    score = 30;
    alignment = 'Weak';
    explanation = `Candidate has experience in ${resumeIndustries[0].name}, but JD requires ${jdIndustries[0].name}.`;
  }
  
  return {
    score,
    resumeIndustries,
    jdIndustries,
    alignment,
    explanation
  };
}

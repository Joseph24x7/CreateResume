import useResumeStore from '../../store/resumeStore'

const ACTION_VERBS = [
  'led','built','developed','designed','implemented','managed','created','delivered',
  'improved','increased','reduced','optimised','architected','launched','established',
  'collaborated','mentored','conducted','deployed','integrated','automated','streamlined',
  'contributed','performed','enhanced','enabled','leveraged','maintained','spearheaded',
]

function computeScore(data) {
  if (!data) return 0
  let score = 0

  const { personalInfo, summary, skillCategories, experiences, achievements, educations } = data

  if (personalInfo?.firstName && personalInfo?.lastName) score += 5
  if (personalInfo?.email) score += 5
  if (personalInfo?.phone) score += 3
  if (personalInfo?.location) score += 2
  if (personalInfo?.linkedin) score += 3
  if (personalInfo?.github) score += 2

  if (summary?.trim().length > 50) score += 10

  if (skillCategories?.some(c => c.skills?.trim())) score += 10

  const expCount = experiences?.length || 0
  if (expCount >= 1) score += 10
  if (expCount >= 2) score += 5
  if (expCount >= 3) score += 5

  const allBullets = (experiences || []).flatMap(e => e.achievements || []).join(' ').toLowerCase()
  const verbCount = ACTION_VERBS.filter(v => allBullets.includes(v)).length
  score += Math.min(verbCount * 2, 10)

  const hasNumbers = /\d+%|\$\d+|\d+[kmb]\b|\d+ (teams?|projects?|systems?|engineers?)/i.test(allBullets)
  if (hasNumbers) score += 10

  if (achievements?.some(a => a.text?.trim())) score += 5
  if (educations?.length > 0) score += 5

  return Math.min(score, 100)
}

export default function ATSScore({ data }) {
  const score = computeScore(data)

  const color = score >= 80 ? '#4ade80' : score >= 55 ? '#f59e0b' : '#f87171'
  const label = score >= 80 ? 'Excellent' : score >= 55 ? 'Good' : 'Needs Work'

  const circumference = 2 * Math.PI * 18
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="ats-score" title={`ATS Score: ${score}/100 – ${label}`}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#2a2f4a" strokeWidth="4" />
        <circle
          cx="22" cy="22" r="18" fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
      <div className="ats-label">
        <span className="ats-heading">ATS</span>
        <span className="ats-status" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

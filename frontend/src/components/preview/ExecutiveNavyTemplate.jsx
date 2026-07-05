import '../../styles/resume-common.css';
import EditableText from '../canvas/EditableText'
import useResumeStore from '../../store/resumeStore'

const newUuid = () => crypto.randomUUID()

const Icon = ({ type }) => {
  const icons = {
    email: '✉',
    phone: '📱',
    location: '📍',
    linkedin: 'in',
    github: '⌥',
    leetcode: '💻',
    website: '🌐',
  }
  return <span className="en-icon">{icons[type] || '•'}</span>
}

function BlockControls({ onMoveUp, onMoveDown, onDelete }) {
  return (
    <div className="block-controls no-print">
      {onMoveUp && <button className="block-control-btn" onClick={onMoveUp} title="Move Up">▲</button>}
      {onMoveDown && <button className="block-control-btn" onClick={onMoveDown} title="Move Down">▼</button>}
      {onDelete && <button className="block-control-btn delete" onClick={onDelete} title="Delete">✕</button>}
    </div>
  )
}

const SectionTitle = ({ children }) => (
  <div className="en-section-header">
    <h2 className="en-section-title">{children}</h2>
    <div className="en-section-rule" />
  </div>
)

export default function ExecutiveNavyTemplate({ data }) {
  const {
    updatePersonalInfo,
    updateSummary,
    updateSkillCategories,
    updateExperiences,
    updateAchievements,
    updateEducations,
    updateLanguages,
    toggleSection
  } = useResumeStore()

  const {
    personalInfo: rawPersonalInfo,
    summary = '',
    skillCategories: rawSkillCategories,
    experiences: rawExperiences,
    achievements: rawAchievements,
    educations: rawEducations,
    languages: rawLanguages,
    hiddenSections: rawHiddenSections,
    font = 'Inter'
  } = data || {}

  const personalInfo = rawPersonalInfo || {}
  const skillCategories = rawSkillCategories || []
  const experiences = rawExperiences || []
  const achievements = rawAchievements || []
  const educations = rawEducations || []
  const languages = rawLanguages || []
  const hiddenSections = rawHiddenSections || []

  const fullName = [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' ')

  const setPI = (key) => (val) => {
    updatePersonalInfo({ ...personalInfo, [key]: val })
  }

  // Skill updates
  const updateCat = (id, field, val) => {
    updateSkillCategories(skillCategories.map(c => c.id === id ? { ...c, [field]: val } : c))
  }
  const removeCat = (id) => {
    updateSkillCategories(skillCategories.filter(c => c.id !== id))
  }
  const moveCat = (idx, dir) => {
    const list = [...skillCategories]
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    updateSkillCategories(list)
  }
  const addSkillCategory = () => {
    updateSkillCategories([...skillCategories, { id: newUuid(), category: '', skills: '' }])
  }

  // Experience updates
  const updateExp = (id, field, val) => {
    updateExperiences(experiences.map(e => e.id === id ? { ...e, [field]: val } : e))
  }
  const removeExp = (id) => {
    updateExperiences(experiences.filter(e => e.id !== id))
  }
  const moveExp = (idx, dir) => {
    const list = [...experiences]
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    updateExperiences(list)
  }
  const updateExpBullet = (expId, bulletIdx, val) => {
    updateExperiences(experiences.map(e => {
      if (e.id !== expId) return e
      const achievements = [...e.achievements]
      achievements[bulletIdx] = val
      return { ...e, achievements }
    }))
  }
  const addExpBullet = (expId, bulletIdx) => {
    updateExperiences(experiences.map(e => {
      if (e.id !== expId) return e
      const achievements = [...e.achievements]
      achievements.splice(bulletIdx + 1, 0, '')
      return { ...e, achievements }
    }))
  }
  const removeExpBullet = (expId, bulletIdx) => {
    updateExperiences(experiences.map(e => {
      if (e.id !== expId) return e
      const achievements = e.achievements.filter((_, i) => i !== bulletIdx)
      return { ...e, achievements: achievements.length ? achievements : [''] }
    }))
  }
  const addExperience = () => {
    updateExperiences([
      ...experiences,
      {
        id: newUuid(),
        role: '',
        company: '',
        startDate: '',
        endDate: '',
        location: '',
        project: '',
        achievements: ['']
      }
    ])
  }

  // Achievement updates
  const updateAch = (id, val) => {
    updateAchievements(achievements.map(a => a.id === id ? { ...a, text: val } : a))
  }
  const removeAch = (id) => {
    updateAchievements(achievements.filter(a => a.id !== id))
  }
  const moveAch = (idx, dir) => {
    const list = [...achievements]
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    updateAchievements(list)
  }
  const addAchievement = () => {
    updateAchievements([...achievements, { id: newUuid(), text: '' }])
  }

  // Education updates
  const updateEdu = (id, field, val) => {
    updateEducations(educations.map(e => e.id === id ? { ...e, [field]: val } : e))
  }
  const removeEdu = (id) => {
    updateEducations(educations.filter(e => e.id !== id))
  }
  const moveEdu = (idx, dir) => {
    const list = [...educations]
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    updateEducations(list)
  }
  const addEducation = () => {
    updateEducations([...educations, { id: newUuid(), degree: '', institution: '', startDate: '', endDate: '', location: '' }])
  }

  // Language updates
  const updateLang = (id, field, val) => {
    updateLanguages(languages.map(l => l.id === id ? { ...l, [field]: val } : l))
  }
  const removeLang = (id) => {
    updateLanguages(languages.filter(l => l.id !== id))
  }
  const moveLang = (idx, dir) => {
    const list = [...languages]
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    updateLanguages(list)
  }
  const addLanguage = () => {
    updateLanguages([...languages, { id: newUuid(), language: '', proficiency: 'Full Professional Proficiency' }])
  }

  return (
    <div className="en-resume" style={{ fontFamily: font }}>
      {/* PAGE 1 */}
      <div className="en-page">
        <header className="en-header">
          <div className="en-header-inner">
            <h1 className="en-name">
              <EditableText value={personalInfo.firstName} onChange={setPI('firstName')} placeholder="First Name" singleLine />
              {' '}
              <EditableText value={personalInfo.lastName} onChange={setPI('lastName')} placeholder="Last Name" singleLine />
            </h1>
            <p className="en-job-title">
              <EditableText value={personalInfo.title} onChange={setPI('title')} placeholder="Profession / Title" singleLine />
            </p>
          </div>
        </header>

        {!hiddenSections.includes('summary') && (
          <div className="en-summary-band">
            <EditableText
              tagName="p"
              className="en-summary-text"
              value={summary}
              onChange={updateSummary}
              placeholder="Professional Summary – Click here to write your bio..."
            />
          </div>
        )}

        <div className="en-contact-bar">
          <div className="en-contact-col">
            <div className="en-contact-item">
              <Icon type="email" />
              <EditableText value={personalInfo.email} onChange={setPI('email')} placeholder="Email Address" singleLine />
            </div>
            <div className="en-contact-item">
              <Icon type="location" />
              <EditableText value={personalInfo.location} onChange={setPI('location')} placeholder="Location (e.g. City, Country)" singleLine />
            </div>
            <div className="en-contact-item">
              <Icon type="linkedin" />
              <EditableText value={personalInfo.linkedin} onChange={setPI('linkedin')} placeholder="LinkedIn URL" singleLine />
            </div>
          </div>
          <div className="en-contact-col">
            <div className="en-contact-item">
              <Icon type="phone" />
              <EditableText value={personalInfo.phone} onChange={setPI('phone')} placeholder="Phone Number" singleLine />
            </div>
            <div className="en-contact-item">
              <Icon type="leetcode" />
              <EditableText value={personalInfo.leetcode} onChange={setPI('leetcode')} placeholder="LeetCode Profile" singleLine />
            </div>
            <div className="en-contact-item">
              <Icon type="github" />
              <EditableText value={personalInfo.github} onChange={setPI('github')} placeholder="GitHub URL" singleLine />
            </div>
          </div>
        </div>

        {!hiddenSections.includes('skills') && (
          <section className="en-section">
            <SectionTitle>Primary Skills</SectionTitle>
            <div className="en-skills-grid">
              {skillCategories.map((cat, idx) => (
                <div key={cat.id} className="en-skill-row canvas-block-wrapper">
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveCat(idx, -1) : null}
                    onMoveDown={idx < skillCategories.length - 1 ? () => moveCat(idx, 1) : null}
                    onDelete={() => removeCat(cat.id)}
                  />
                  <EditableText
                    className="en-skill-category"
                    value={cat.category}
                    onChange={(val) => updateCat(cat.id, 'category', val)}
                    placeholder="Category (e.g. Languages)"
                    singleLine
                  />
                  <EditableText
                    className="en-skill-values"
                    value={cat.skills}
                    onChange={(val) => updateCat(cat.id, 'skills', val)}
                    placeholder="Skills (comma or pipe separated)"
                    singleLine
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {!hiddenSections.includes('experience') && (
          <section className="en-section">
            <SectionTitle>Employment History</SectionTitle>
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="en-experience canvas-block-wrapper">
                <BlockControls
                  onMoveUp={idx > 0 ? () => moveExp(idx, -1) : null}
                  onMoveDown={idx < experiences.length - 1 ? () => moveExp(idx, 1) : null}
                  onDelete={() => removeExp(exp.id)}
                />
                <div className="en-exp-role">
                  <EditableText value={exp.role} onChange={(val) => updateExp(exp.id, 'role', val)} placeholder="Job Title" singleLine />
                </div>
                <div className="en-exp-company">
                  <EditableText value={exp.company} onChange={(val) => updateExp(exp.id, 'company', val)} placeholder="Company Name" singleLine />
                </div>
                <div className="en-exp-meta">
                  <span className="en-exp-dates">
                    <EditableText value={exp.startDate} onChange={(val) => updateExp(exp.id, 'startDate', val)} placeholder="Start Date" singleLine />
                    {' – '}
                    <EditableText value={exp.endDate} onChange={(val) => updateExp(exp.id, 'endDate', val)} placeholder="End Date (or Present)" singleLine />
                  </span>
                  <span className="en-exp-location">
                    <EditableText value={exp.location} onChange={(val) => updateExp(exp.id, 'location', val)} placeholder="Job Location" singleLine />
                  </span>
                </div>
                <div className="en-exp-project">
                  Project Team:{' '}
                  <EditableText value={exp.project} onChange={(val) => updateExp(exp.id, 'project', val)} placeholder="Project/Team Description" singleLine />
                </div>

                <div className="en-exp-ach-label">Achievements/Tasks</div>
                <ul className="en-exp-bullets">
                  {(exp.achievements || ['']).map((ach, bIdx) => (
                    <li key={bIdx} className="bullet-wrapper">
                      <EditableText
                        value={ach}
                        onChange={(val) => updateExpBullet(exp.id, bIdx, val)}
                        placeholder="Describe your achievement..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addExpBullet(exp.id, bIdx)
                          } else if (e.key === 'Backspace' && !ach && exp.achievements.length > 1) {
                            e.preventDefault()
                            removeExpBullet(exp.id, bIdx)
                          }
                        }}
                      />
                      <button
                        className="bullet-delete-btn no-print"
                        onClick={() => removeExpBullet(exp.id, bIdx)}
                        disabled={exp.achievements.length <= 1}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* PAGE BREAK SEPARATOR FOR EDITOR */}
      <div className="page-break-gap no-print">
        <div className="page-break-line"></div>
        <span className="page-break-label">Page 2 (Continuation)</span>
      </div>

      {/* PAGE 2 */}
      <div className="en-page">

        {!hiddenSections.includes('achievements') && (
          <section className="en-section">
            <SectionTitle>Achievements</SectionTitle>
            <div className="en-achievements-grid">
              {achievements.map((ach, idx) => (
                <div key={ach.id} className="en-achievement-cell canvas-block-wrapper">
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveAch(idx, -1) : null}
                    onMoveDown={idx < achievements.length - 1 ? () => moveAch(idx, 1) : null}
                    onDelete={() => removeAch(ach.id)}
                  />
                  <EditableText
                    value={ach.text}
                    onChange={(val) => updateAch(ach.id, val)}
                    placeholder="Achievement detail..."
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {!hiddenSections.includes('education') && (
          <section className="en-section">
            <SectionTitle>Education</SectionTitle>
            {educations.map((edu, idx) => (
              <div key={edu.id} className="en-education canvas-block-wrapper">
                <BlockControls
                  onMoveUp={idx > 0 ? () => moveEdu(idx, -1) : null}
                  onMoveDown={idx < educations.length - 1 ? () => moveEdu(idx, 1) : null}
                  onDelete={() => removeEdu(edu.id)}
                />
                <div className="en-edu-degree">
                  <EditableText value={edu.degree} onChange={(val) => updateEdu(edu.id, 'degree', val)} placeholder="Degree / Qualification" singleLine />
                </div>
                <div className="en-edu-institution">
                  <EditableText value={edu.institution} onChange={(val) => updateEdu(edu.id, 'institution', val)} placeholder="School/University Name" singleLine />
                </div>
                <div className="en-edu-meta">
                  <span>
                    <EditableText value={edu.startDate} onChange={(val) => updateEdu(edu.id, 'startDate', val)} placeholder="Start Date" singleLine />
                    {' – '}
                    <EditableText value={edu.endDate} onChange={(val) => updateEdu(edu.id, 'endDate', val)} placeholder="End Date" singleLine />
                  </span>
                  <span className="en-edu-location">
                    <EditableText value={edu.location} onChange={(val) => updateEdu(edu.id, 'location', val)} placeholder="Location" singleLine />
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {!hiddenSections.includes('languages') && (
          <section className="en-section">
            <SectionTitle>Languages</SectionTitle>
            <div className="en-languages-grid">
              {languages.map((lang, idx) => (
                <div key={lang.id} className="en-language-item canvas-block-wrapper">
                  <BlockControls
                    onMoveUp={idx > 0 ? () => moveLang(idx, -1) : null}
                    onMoveDown={idx < languages.length - 1 ? () => moveLang(idx, 1) : null}
                    onDelete={() => removeLang(lang.id)}
                  />
                  <div className="en-lang-name">
                    <EditableText value={lang.language} onChange={(val) => updateLang(lang.id, 'language', val)} placeholder="Language" singleLine />
                  </div>
                  <div className="en-lang-proficiency">
                    <EditableText value={lang.proficiency} onChange={(val) => updateLang(lang.id, 'proficiency', val)} placeholder="Proficiency Level" singleLine />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import useResumeStore from '../../store/resumeStore'

const newUuid = () => crypto.randomUUID()

export default function FloatingToolbar() {
  const { resume, toggleSection, updateExperiences, updateSkillCategories, updateAchievements, updateEducations, updateLanguages } = useResumeStore()
  const [showSectionsMenu, setShowSectionsMenu] = useState(false)

  if (!resume) return null

  const data = resume.data || {}
  const hidden = data.hiddenSections || []

  const sections = [
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'languages', label: 'Languages', icon: '🌐' },
  ]

  const addJob = () => {
    const list = data.experiences || []
    updateExperiences([
      ...list,
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
    if (hidden.includes('experience')) toggleSection('experience')
  }

  const addSkill = () => {
    const list = data.skillCategories || []
    updateSkillCategories([...list, { id: newUuid(), category: '', skills: '' }])
    if (hidden.includes('skills')) toggleSection('skills')
  }

  const addAchievement = () => {
    const list = data.achievements || []
    updateAchievements([...list, { id: newUuid(), text: '' }])
    if (hidden.includes('achievements')) toggleSection('achievements')
  }

  const addEducation = () => {
    const list = data.educations || []
    updateEducations([
      ...list,
      { id: newUuid(), degree: '', institution: '', startDate: '', endDate: '', location: '' }
    ])
    if (hidden.includes('education')) toggleSection('education')
  }

  const addLanguage = () => {
    const list = data.languages || []
    updateLanguages([...list, { id: newUuid(), language: '', proficiency: 'Full Professional Proficiency' }])
    if (hidden.includes('languages')) toggleSection('languages')
  }

  return (
    <div className="floating-toolbar">
      <div className="toolbar-section">
        <button
          className={`toolbar-btn ${showSectionsMenu ? 'active' : ''}`}
          onClick={() => setShowSectionsMenu(!showSectionsMenu)}
          title="Toggle Sections"
        >
          👁️
        </button>

        {showSectionsMenu && (
          <div className="sections-menu">
            <h4 className="menu-title">Show/Hide Sections</h4>
            {sections.map(s => (
              <label key={s.id} className="menu-item">
                <input
                  type="checkbox"
                  checked={!hidden.includes(s.id)}
                  onChange={() => toggleSection(s.id)}
                />
                <span>{s.icon} {s.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      <button className="toolbar-btn" onClick={addJob} title="Add Experience">💼</button>
      <button className="toolbar-btn" onClick={addSkill} title="Add Skill Category">⚡</button>
      <button className="toolbar-btn" onClick={addAchievement} title="Add Achievement">🏆</button>
      <button className="toolbar-btn" onClick={addEducation} title="Add Education">🎓</button>
      <button className="toolbar-btn" onClick={addLanguage} title="Add Language">🌐</button>
    </div>
  )
}

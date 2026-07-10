import React, { useLayoutEffect, useState, useRef, useEffect } from 'react'
import '../../styles/resume-common.css';
import EditableText from '../canvas/EditableText'
import useResumeStore from '../../store/resumeStore'

const newUuid = () => crypto.randomUUID()

const Icon = ({ type }) => {
  const icons = {
    email: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    phone: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    location: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    linkedin: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    github: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    leetcode: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.102 17.93l-2.69 2.607c-.466.451-1.111.696-1.744.696a2.285 2.285 0 0 1-1.744-.696L3.666 14.3c-.454-.44-.71-1.07-.71-1.717 0-.646.256-1.276.71-1.716L10.3 4.675c.466-.452 1.112-.696 1.744-.696.633 0 1.278.244 1.744.696l2.32 2.247a1.06 1.06 0 0 1 0 1.524 1.127 1.127 0 0 1-1.568 0l-2.32-2.247c-.044-.043-.16-.142-.497-.142-.336 0-.453.1-.497.142L5.23 12.583c-.043.042-.149.141-.149.44 0 .3.106.398.15.441l6.257 6.06c.044.043.16.142.497.142.336 0 .453-.1.497-.142l2.69-2.607a1.125 1.125 0 0 1 1.568 0 1.062 1.062 0 0 1 0 1.524zm3.846-3.569a1.061 1.061 0 0 1 0-1.524l-5.698-5.518a1.127 1.127 0 0 1 0-1.524 1.061 1.061 0 0 1 1.568 0l5.698 5.517a3.18 3.18 0 0 1 0 4.572l-5.698 5.517a1.059 1.059 0 0 1-1.568 0 1.125 1.125 0 0 1 0-1.524l5.698-5.516z" />
      </svg>
    ),
    website: (
      <svg className="en-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
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

const SectionIcon = ({ type, template }) => {
  if (template !== 'minimalist-accent' && template !== 'elegant-diamond') return null

  const minimalistIcons = {
    skills: '⚡',
    experience: '💼',
    achievements: '🏆',
    education: '🎓',
    languages: '🌐',
  }

  const diamondIcons = {
    skills: '❖',
    experience: '❖',
    achievements: '❖',
    education: '❖',
    languages: '❖',
  }

  const iconSymbol = template === 'elegant-diamond' 
    ? diamondIcons[type] 
    : minimalistIcons[type]

  if (!iconSymbol) return null

  return <span className="section-title-icon" style={{ marginRight: '8px' }}>{iconSymbol}</span>
}

const PageSpacer = ({ id, spacers }) => {
  const height = spacers ? (spacers[id] || 0) : 0
  if (height <= 0) return null
  return <div style={{ height: `${height}px` }} className="en-page-spacer" data-spacer-id={id} />
}

const SectionTitle = ({ children, type, template, spacers }) => (
  <>
    <PageSpacer id={`header-${type}`} spacers={spacers} />
    <div className="en-section-header" data-page-block="true" data-block-id={`header-${type}`}>
      <h2 className="en-section-title">
        <SectionIcon type={type} template={template} />
        <span>{children}</span>
      </h2>
      <div className="en-section-rule" />
    </div>
  </>
)

export default function ExecutiveNavyTemplate({ data, spacers: propsSpacers = {}, setSpacers, isMaster = false, onLayoutCalculated }) {
  const lastCalculatedSpacersRef = useRef({})
  const spacers = isMaster ? {} : propsSpacers
  const containerRef = useRef(null)


  const [fontReadyTrigger, setFontReadyTrigger] = useState(0)

  // NOTE: Fonts coordination is handled by PreviewPanel via the onLayoutCalculated callback.
  // We use fontReadyTrigger only to re-run layout after fonts are confirmed loaded.
  useEffect(() => {
    // Subscribe only once on mount
    document.fonts.ready.then(() => {
      setFontReadyTrigger(prev => prev + 1)
    })
  }, [])

  // Debounce timer ref to avoid layout thrashing on every keystroke
  const layoutDebounceRef = useRef(null)

  useLayoutEffect(() => {
    if (!isMaster || !containerRef.current) return

    clearTimeout(layoutDebounceRef.current)
    layoutDebounceRef.current = setTimeout(() => {
      if (!containerRef.current) return

      const PAGE_H = 1051 // A4 content height in px
      const elements = Array.from(containerRef.current.querySelectorAll('[data-page-block="true"]'))

      const containerRect = containerRef.current.getBoundingClientRect()
      if (containerRect.width === 0) return // not rendered yet

      const scaleFactor = containerRect.width / 794

      // Step 1: Map elements to block objects and calculate unspacedStartY
      const blocks = elements.map((el) => {
        const blockId = el.getAttribute('data-block-id')
        const rect = el.getBoundingClientRect()
        const height = rect.height / scaleFactor
        const unspacedStartY = (rect.top - containerRect.top) / scaleFactor

        return {
          blockId,
          height,
          unspacedStartY,
          spacerHeight: 0,
          isSectionHeader: el.classList.contains('en-section-header'),
          isExpHeader: el.classList.contains('en-exp-header-block'),
          isBullet: el.classList.contains('bullet-wrapper'),
        }
      })


      // Step 2: Group bullets into their experience headers
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i]
        if (b.isExpHeader) {
          b.bullets = []
          const expId = b.blockId.replace('exp-hdr-', '')
          for (let j = i + 1; j < blocks.length; j++) {
            const nextBlock = blocks[j]
            if (nextBlock.blockId.startsWith(`exp-bullet-${expId}-`)) {
              b.bullets.push(nextBlock)
            } else if (nextBlock.isExpHeader || nextBlock.isSectionHeader) {
              break
            }
          }
        }
      }

      // Helper to find the page index and offset for a given Y coordinate
      const getPageInfo = (y) => {
        const PAGE_1_H = 1087 // Page 1 height (no top margin)
        const PAGE_N_H = 1051 // Subsequent pages height (has top margin)
        
        if (y < PAGE_1_H) {
          return { pageIdx: 0, offset: y, remaining: PAGE_1_H - y }
        } else {
          const restY = y - PAGE_1_H
          const pageIdx = 1 + Math.floor(restY / PAGE_N_H)
          const offset = restY % PAGE_N_H
          return { pageIdx, offset, remaining: PAGE_N_H - offset }
        }
      }

      // Step 3: Run the simulation sequentially
      let accumulatedSpacers = 0
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i]

        // Simulated start position is the natural position plus all spacers added so far!
        const simulatedStartY = b.unspacedStartY + accumulatedSpacers
        const startInfo = getPageInfo(simulatedStartY)

        let spacerHeight = 0

        if (b.isSectionHeader) {
          // Section Title: keep together with the first entry of that section
          let groupHeight = b.height
          if (i + 1 < blocks.length) {
            const nextBlock = blocks[i + 1]
            let targetBlock = nextBlock
            if (nextBlock.isExpHeader && nextBlock.bullets && nextBlock.bullets.length > 0) {
              targetBlock = nextBlock.bullets[0]
            }
            groupHeight = (targetBlock.unspacedStartY + targetBlock.height) - b.unspacedStartY
          }

          const endInfo = getPageInfo(simulatedStartY + groupHeight - 0.1)
          if (startInfo.pageIdx !== endInfo.pageIdx && groupHeight < 1051) {
            spacerHeight = startInfo.remaining
          }
        } else if (b.isExpHeader) {
          // Experience Header: keep together with all bullets if possible,
          // or at least with the first bullet if the whole experience is too tall.
          let totalHeight = b.height
          let minHeight = b.height
          if (b.bullets && b.bullets.length > 0) {
            const lastBullet = b.bullets[b.bullets.length - 1]
            const firstBullet = b.bullets[0]
            totalHeight = (lastBullet.unspacedStartY + lastBullet.height) - b.unspacedStartY
            minHeight = (firstBullet.unspacedStartY + firstBullet.height) - b.unspacedStartY
          }

          const totalEndInfo = getPageInfo(simulatedStartY + totalHeight - 0.1)
          const minEndInfo = getPageInfo(simulatedStartY + minHeight - 0.1)

          if (totalHeight < 1051) {
            if (startInfo.pageIdx !== totalEndInfo.pageIdx) {
              spacerHeight = startInfo.remaining
            }
          } else {
            if (startInfo.pageIdx !== minEndInfo.pageIdx) {
              spacerHeight = startInfo.remaining
            }
          }
        } else {
          // Standard block or individual bullet: avoid splitting internally
          const endInfo = getPageInfo(simulatedStartY + b.height - 0.1)
          if (startInfo.pageIdx !== endInfo.pageIdx && b.height < 1051) {
            spacerHeight = startInfo.remaining
          }
        }

        if (spacerHeight > 0) {
          b.spacerHeight = spacerHeight
          accumulatedSpacers += spacerHeight
        }
      }



      // Step 4: Extract calculated spacers
      const newSpacers = {}
      blocks.forEach((b) => {
        if (b.spacerHeight > 0) {
          newSpacers[b.blockId] = Math.ceil(b.spacerHeight)
        }
      })

      if (JSON.stringify(newSpacers) !== JSON.stringify(lastCalculatedSpacersRef.current)) {
        lastCalculatedSpacersRef.current = newSpacers
        if (setSpacers) setSpacers(newSpacers)
      }


      // Signal layout done
      if (onLayoutCalculated) {
        requestAnimationFrame(onLayoutCalculated)
      }
    }, 50)

    return () => clearTimeout(layoutDebounceRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isMaster, setSpacers, fontReadyTrigger])

  // Note: onLayoutCalculated intentionally omitted — it's a stable useCallback ref in PreviewPanel

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
    font = 'Merriweather Sans',
    template = 'executive-navy',
    fontSize = 'medium',
    showMonogram = false
  } = data || {}

  const getFontFamily = (fontName) => {
    if (fontName === 'Merriweather Sans') {
      return '"Merriweather Sans", Arial, Helvetica, sans-serif'
    }
    if (fontName === 'Halyard Text') {
      return '"Halyard Text Regular", "Halyard Text", sans-serif'
    }
    if (fontName === 'Minion 3 Display') {
      return '"Minion 3 Display Bold", "Minion 3 Display", "Minion 3", "Minion", serif'
    }
    if (fontName === 'Spinoza Pro') {
      return '"Spinoza Pro Regular", "Spinoza Pro", serif'
    }
    return fontName
  }


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
    <div ref={containerRef} className={`en-resume template-${template} size-${fontSize}`} style={{ fontFamily: getFontFamily(font) }}>


        <header className="en-header" style={{ display: 'flex', alignItems: 'center' }}>
          {template === 'elegant-diamond' && showMonogram && (
            <div className="en-header-monogram" style={{ marginRight: '20px' }}>
              <div className="monogram-diamond">
                <span className="monogram-text">
                  {((personalInfo.firstName || '').charAt(0) + (personalInfo.lastName || '').charAt(0)).toUpperCase() || 'ID'}
                </span>
              </div>
            </div>
          )}
          <div className="en-header-inner" style={{ flexGrow: 1 }}>
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
          <React.Fragment>
            <PageSpacer id="summary" spacers={spacers} />
            <div data-page-block="true" data-block-id="summary" className="en-summary-band">
              <EditableText
                tagName="p"
                className="en-summary-text"
                value={summary}
                onChange={updateSummary}
                placeholder="Professional Summary – Click here to write your bio..."
              />
            </div>
          </React.Fragment>
        )}

        <div data-page-block="true" data-block-id="contact" className="en-contact-bar">
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
            <SectionTitle type="skills" template={template} spacers={spacers}>Primary Skills</SectionTitle>
            <div className="en-skills-grid">
              {Array.from({ length: Math.ceil(skillCategories.length / 2) }).map((_, rowIdx) => {
                const idx1 = rowIdx * 2
                const idx2 = rowIdx * 2 + 1
                const cat1 = skillCategories[idx1]
                const cat2 = skillCategories[idx2]

                return (
                  <div key={rowIdx} className="en-skills-row">
                    <div className="en-skills-col">
                      {cat1 && (
                        <React.Fragment>
                          <PageSpacer id={`skill-${cat1.id}`} spacers={spacers} />
                          <div data-page-block="true" data-block-id={`skill-${cat1.id}`} className="en-skill-row canvas-block-wrapper">
                            <BlockControls
                              onMoveUp={idx1 > 0 ? () => moveCat(idx1, -1) : null}
                              onMoveDown={idx1 < skillCategories.length - 1 ? () => moveCat(idx1, 1) : null}
                              onDelete={() => removeCat(cat1.id)}
                            />
                            <EditableText
                              className="en-skill-category"
                              value={cat1.category}
                              onChange={(val) => updateCat(cat1.id, 'category', val)}
                              placeholder="Category"
                              singleLine
                            />
                            <EditableText
                              className="en-skill-values"
                              value={cat1.skills}
                              onChange={(val) => updateCat(cat1.id, 'skills', val)}
                              placeholder="Skills"
                              singleLine
                            />
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                    <div className="en-skills-col">
                      {cat2 && (
                        <React.Fragment>
                          <PageSpacer id={`skill-${cat2.id}`} spacers={spacers} />
                          <div data-page-block="true" data-block-id={`skill-${cat2.id}`} className="en-skill-row canvas-block-wrapper">
                            <BlockControls
                              onMoveUp={idx2 > 0 ? () => moveCat(idx2, -1) : null}
                              onMoveDown={idx2 < skillCategories.length - 1 ? () => moveCat(idx2, 1) : null}
                              onDelete={() => removeCat(cat2.id)}
                            />
                            <EditableText
                              className="en-skill-category"
                              value={cat2.category}
                              onChange={(val) => updateCat(cat2.id, 'category', val)}
                              placeholder="Category"
                              singleLine
                            />
                            <EditableText
                              className="en-skill-values"
                              value={cat2.skills}
                              onChange={(val) => updateCat(cat2.id, 'skills', val)}
                              placeholder="Skills"
                              singleLine
                            />
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {!hiddenSections.includes('experience') && (
          <section className="en-section">
            <SectionTitle type="experience" template={template} spacers={spacers}>Employment History</SectionTitle>
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="en-experience">
                <PageSpacer id={`exp-hdr-${exp.id}`} spacers={spacers} />
                <div 
                  data-page-block="true" 
                  data-block-id={`exp-hdr-${exp.id}`} 
                  className="en-exp-header-block canvas-block-wrapper"
                >
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
                </div>

                <ul className="en-exp-bullets">
                  {(exp.achievements || ['']).map((ach, bIdx) => (
                    <React.Fragment key={bIdx}>
                      <PageSpacer id={`exp-bullet-${exp.id}-${bIdx}`} spacers={spacers} />
                      <li 
                        key={bIdx}
                        data-page-block="true"
                        data-block-id={`exp-bullet-${exp.id}-${bIdx}`}
                        className="bullet-wrapper"
                      >
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
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      )}


        {!hiddenSections.includes('achievements') && (
          <section className="en-section">
            <SectionTitle type="achievements" template={template} spacers={spacers}>Achievements</SectionTitle>
            <div className="en-achievements-grid">
              {achievements.map((ach, idx) => (
                <React.Fragment key={ach.id}>
                  <PageSpacer id={`ach-${ach.id}`} spacers={spacers} />
                  <div data-page-block="true" data-block-id={`ach-${ach.id}`} className="en-achievement-cell canvas-block-wrapper">
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
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {!hiddenSections.includes('education') && (
          <section className="en-section">
            <SectionTitle type="education" template={template} spacers={spacers}>Education</SectionTitle>
            {educations.map((edu, idx) => (
              <React.Fragment key={edu.id}>
                <PageSpacer id={`edu-${edu.id}`} spacers={spacers} />
                <div data-page-block="true" data-block-id={`edu-${edu.id}`} className="en-education canvas-block-wrapper">
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
              </React.Fragment>
            ))}
          </section>
        )}

        {!hiddenSections.includes('languages') && (
          <section className="en-section">
            <SectionTitle type="languages" template={template} spacers={spacers}>Languages</SectionTitle>
            <div className="en-languages-grid">
              {languages.map((lang, idx) => (
                <React.Fragment key={lang.id}>
                  <PageSpacer id={`lang-${lang.id}`} spacers={spacers} />
                  <div data-page-block="true" data-block-id={`lang-${lang.id}`} className="en-language-item canvas-block-wrapper">
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
                </React.Fragment>
              ))}
            </div>
          </section>
        )}
    </div>
  )
}

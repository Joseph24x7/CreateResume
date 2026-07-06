import { create } from 'zustand'
import { resumeApi } from '../api/resumeApi'

const newUuid = () => crypto.randomUUID()

export const defaultData = () => ({
  personalInfo: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    leetcode: '',
  },
  summary: '',
  skillCategories: [
    { id: newUuid(), category: '', skills: '' }
  ],
  experiences: [
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
  ],
  achievements: [
    { id: newUuid(), text: '' }
  ],
  educations: [
    {
      id: newUuid(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      location: ''
    }
  ],
  languages: [
    { id: newUuid(), language: '', proficiency: '' }
  ],
  hiddenSections: [],
  font: 'Mantika Sans',
  template: 'executive-navy',
  fontSize: 'medium',
})

const useResumeStore = create((set, get) => ({
  resume: null,
  resumeList: [],
  loading: false,
  saving: false,
  lastSaved: null,
  error: null,
  activeSection: 'personal',
  undoHistory: [],
  redoHistory: [],
  lastHistoryPushTime: 0,

  updateResumeData: (newData) => {
    set(state => {
      if (!state.resume) return {}
      
      const now = Date.now()
      const history = state.undoHistory || []
      const currentDataStr = JSON.stringify(state.resume.data)
      
      let newHistory = history
      // Push current state to history if different from last history item AND either:
      // 1. History is empty
      // 2. More than 1200ms has passed since last push (debouncing typing sessions)
      if (history.length === 0) {
        newHistory = [JSON.parse(currentDataStr)]
      } else {
        const lastHistoryStr = JSON.stringify(history[history.length - 1])
        if (currentDataStr !== lastHistoryStr) {
          const timeSinceLastPush = now - state.lastHistoryPushTime
          if (timeSinceLastPush > 1200) {
            newHistory = [...history, JSON.parse(currentDataStr)]
            if (newHistory.length > 50) newHistory.shift()
          }
        }
      }

      const nextHistoryState = {
        resume: {
          ...state.resume,
          data: newData
        },
        undoHistory: newHistory,
        redoHistory: [] // Clear redo history on new edit
      }
      
      if (newHistory !== history) {
        nextHistoryState.lastHistoryPushTime = now
      }
      
      return nextHistoryState
    })
  },

  undo: () => {
    set(state => {
      const history = [...state.undoHistory]
      if (history.length === 0) return {}
      const previousData = history.pop()
      const currentData = JSON.parse(JSON.stringify(state.resume.data))
      return {
        resume: {
          ...state.resume,
          data: previousData
        },
        undoHistory: history,
        redoHistory: [...(state.redoHistory || []), currentData]
      }
    })
  },

  redo: () => {
    set(state => {
      const redo = [...(state.redoHistory || [])]
      if (redo.length === 0) return {}
      const nextData = redo.pop()
      const currentData = JSON.parse(JSON.stringify(state.resume.data))
      return {
        resume: {
          ...state.resume,
          data: nextData
        },
        undoHistory: [...state.undoHistory, currentData],
        redoHistory: redo
      }
    })
  },

  toggleSection: (sectionId) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    const data = resume.data || {}
    const hidden = data.hiddenSections || []
    const newHidden = hidden.includes(sectionId)
      ? hidden.filter(id => id !== sectionId)
      : [...hidden, sectionId]
    updateResumeData({ ...data, hiddenSections: newHidden })
  },

  setActiveSection: (section) => set({ activeSection: section }),

  setError: (error) => set({ error }),

  updateTitle: (title) => {
    // Route through updateResumeData so title changes are tracked in undo history
    const { resume } = get()
    if (!resume) return
    set(state => ({ resume: { ...state.resume, title } }))
  },

  updateData: (patch) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, ...patch })
  },

  updatePersonalInfo: (personalInfo) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, personalInfo })
  },

  updateSummary: (summary) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, summary })
  },

  updateSkillCategories: (skillCategories) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, skillCategories })
  },

  updateExperiences: (experiences) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, experiences })
  },

  updateAchievements: (achievements) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, achievements })
  },

  updateEducations: (educations) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, educations })
  },

  updateLanguages: (languages) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, languages })
  },

  updateFont: (font) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, font })
  },

  updateTemplate: (template) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, template })
  },

  updateFontSize: (fontSize) => {
    const { resume, updateResumeData } = get()
    if (!resume) return
    updateResumeData({ ...resume.data, fontSize })
  },

  fetchResumeList: async () => {
    set({ loading: true, error: null })
    try {
      const list = await resumeApi.getAll()
      set({ resumeList: list, loading: false })
    } catch {
      set({ error: 'Failed to load resumes', loading: false })
    }
  },

  loadResume: async (id) => {
    set({ resume: null, loading: true, error: null, undoHistory: [], redoHistory: [] })
    try {
      const resume = await resumeApi.getById(id)
      set({ resume, loading: false, lastSaved: new Date() })
    } catch {
      set({ error: 'Resume not found', loading: false })
    }
  },

  createResume: async (title) => {
    const resume = await resumeApi.create({ title: title || 'Untitled Resume' })
    set(state => ({ resumeList: [resume, ...state.resumeList] }))
    return resume.id
  },

  saveResume: async () => {
    const { resume } = get()
    if (!resume) return
    set({ saving: true })
    try {
      const updated = await resumeApi.update(resume.id, {
        title: resume.title,
        data: resume.data,
      })
      set({ resume: updated, saving: false, lastSaved: new Date() })
    } catch {
      set({ saving: false, error: 'Save failed' })
    }
  },

  deleteResume: async (id) => {
    await resumeApi.delete(id)
    set(state => ({ resumeList: state.resumeList.filter(r => r.id !== id) }))
  },

  downloadPdf: async () => {
    const { resume } = get()
    if (!resume) return
    await resumeApi.downloadPdf(resume.id, `${resume.title}.pdf`)
  },
}))

export default useResumeStore

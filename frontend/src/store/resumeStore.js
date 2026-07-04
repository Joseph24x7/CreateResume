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
  font: 'Inter',
})

const useResumeStore = create((set, get) => ({
  resume: null,
  resumeList: [],
  loading: false,
  saving: false,
  lastSaved: null,
  error: null,
  activeSection: 'personal',

  toggleSection: (sectionId) =>
    set(state => {
      if (!state.resume) return {}
      const data = state.resume.data || {}
      const hidden = data.hiddenSections || []
      const newHidden = hidden.includes(sectionId)
        ? hidden.filter(id => id !== sectionId)
        : [...hidden, sectionId]
      return {
        resume: {
          ...state.resume,
          data: { ...data, hiddenSections: newHidden }
        }
      }
    }),

  setActiveSection: (section) => set({ activeSection: section }),

  setError: (error) => set({ error }),

  updateTitle: (title) =>
    set(state => ({ resume: { ...state.resume, title } })),

  updateData: (patch) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, ...patch } },
    })),

  updatePersonalInfo: (personalInfo) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, personalInfo } },
    })),

  updateSummary: (summary) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, summary } },
    })),

  updateSkillCategories: (skillCategories) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, skillCategories } },
    })),

  updateExperiences: (experiences) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, experiences } },
    })),

  updateAchievements: (achievements) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, achievements } },
    })),

  updateEducations: (educations) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, educations } },
    })),

  updateLanguages: (languages) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, languages } },
    })),

  updateFont: (font) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, font } },
    })),

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
    set({ loading: true, error: null })
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
